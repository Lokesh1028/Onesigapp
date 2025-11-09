#!/usr/bin/env python3
"""
OneSig SEC Form 4 Insider Trade Scraper

This script collects insider trading data from SEC EDGAR Form 4 filings,
processes the data, and exports it for newsletter curation.

Usage:
    python sec_scraper.py [--days DAYS] [--output OUTPUT]

Example:
    python sec_scraper.py --days 7 --output trades.csv
"""

import argparse
import csv
import logging
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
from xml.etree import ElementTree as ET

import pandas as pd
import requests
from bs4 import BeautifulSoup
from ratelimit import limits, sleep_and_retry

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('sec_scraper.log')
    ]
)
logger = logging.getLogger(__name__)

# SEC EDGAR Configuration
SEC_BASE_URL = "https://www.sec.gov"
EDGAR_SEARCH_URL = f"{SEC_BASE_URL}/cgi-bin/browse-edgar"
USER_AGENT = "OneSig contact@onesig.co"
HEADERS = {"User-Agent": USER_AGENT}

# Rate limiting: 1 request per second (SEC allows 10/sec, but we're conservative)
RATE_LIMIT_CALLS = 1
RATE_LIMIT_PERIOD = 1  # seconds


class SECInsiderTradeScraper:
    """Scraper for SEC Form 4 insider trading data."""

    def __init__(self, user_agent: str = USER_AGENT):
        """Initialize the scraper with SEC-compliant headers."""
        self.headers = {"User-Agent": user_agent}
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    @sleep_and_retry
    @limits(calls=RATE_LIMIT_CALLS, period=RATE_LIMIT_PERIOD)
    def _rate_limited_get(self, url: str) -> requests.Response:
        """Make a rate-limited GET request to SEC EDGAR."""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            raise

    def get_recent_form4_filings(self, days: int = 7) -> List[Dict]:
        """
        Fetch recent Form 4 filings from SEC EDGAR.

        Args:
            days: Number of days to look back for filings

        Returns:
            List of filing metadata dictionaries
        """
        logger.info(f"Fetching Form 4 filings from last {days} days...")

        start_date = (datetime.now() - timedelta(days=days)).strftime("%Y%m%d")

        # Search parameters
        params = {
            "action": "getcompany",
            "type": "4",
            "dateb": "",  # End date (today)
            "datea": start_date,  # Start date
            "count": 100,  # Results per page
            "search_text": "",
            "output": "atom"  # XML format for easier parsing
        }

        filings = []
        page = 0
        max_pages = 10  # Limit to prevent excessive requests

        while page < max_pages:
            params["start"] = page * 100

            try:
                response = self._rate_limited_get(EDGAR_SEARCH_URL)
                soup = BeautifulSoup(response.content, 'xml')

                entries = soup.find_all('entry')
                if not entries:
                    break  # No more results

                for entry in entries:
                    filing = self._parse_filing_entry(entry)
                    if filing:
                        filings.append(filing)

                logger.info(f"Processed page {page + 1}, found {len(entries)} filings")
                page += 1

            except Exception as e:
                logger.error(f"Error processing page {page}: {e}")
                break

        logger.info(f"Total filings found: {len(filings)}")
        return filings

    def _parse_filing_entry(self, entry) -> Optional[Dict]:
        """Parse a single filing entry from SEC EDGAR search results."""
        try:
            title = entry.find('title').text if entry.find('title') else ""
            filing_link = entry.find('link', {'rel': 'alternate'})
            filing_url = filing_link['href'] if filing_link else ""

            # Extract company name and CIK
            company_name = title.split(' - ')[0] if ' - ' in title else ""

            # Extract filing date
            updated = entry.find('updated')
            filing_date = updated.text.split('T')[0] if updated else ""

            return {
                "company_name": company_name.strip(),
                "filing_date": filing_date,
                "filing_url": filing_url,
                "title": title.strip()
            }
        except Exception as e:
            logger.warning(f"Error parsing filing entry: {e}")
            return None

    def get_filing_details(self, filing_url: str) -> Optional[Dict]:
        """
        Fetch and parse detailed information from a Form 4 filing.

        Args:
            filing_url: URL to the filing detail page

        Returns:
            Dictionary with parsed insider trade details
        """
        try:
            # Get the filing detail page
            response = self._rate_limited_get(filing_url)
            soup = BeautifulSoup(response.content, 'html.parser')

            # Find the XML document link
            xml_link = None
            for link in soup.find_all('a'):
                href = link.get('href', '')
                if '.xml' in href and 'primary_doc' not in href:
                    xml_link = f"{SEC_BASE_URL}{href}" if href.startswith('/') else href
                    break

            if not xml_link:
                logger.warning(f"No XML document found for {filing_url}")
                return None

            # Parse the XML document
            xml_response = self._rate_limited_get(xml_link)
            return self._parse_form4_xml(xml_response.content, filing_url)

        except Exception as e:
            logger.error(f"Error fetching filing details from {filing_url}: {e}")
            return None

    def _parse_form4_xml(self, xml_content: bytes, filing_url: str) -> Optional[Dict]:
        """
        Parse Form 4 XML to extract insider trade details.

        Args:
            xml_content: Raw XML content
            filing_url: Original filing URL for reference

        Returns:
            Dictionary with extracted trade information
        """
        try:
            root = ET.fromstring(xml_content)

            # Extract reporting owner information
            reporting_owner = root.find('.//reportingOwner')
            if reporting_owner is None:
                return None

            owner_name = self._get_xml_text(reporting_owner, './/rptOwnerName')
            is_director = self._get_xml_text(reporting_owner, './/isDirector') == '1'
            is_officer = self._get_xml_text(reporting_owner, './/isOfficer') == '1'
            officer_title = self._get_xml_text(reporting_owner, './/officerTitle')

            # Extract issuer (company) information
            issuer = root.find('.//issuer')
            ticker = self._get_xml_text(issuer, './/issuerTradingSymbol')
            company_name = self._get_xml_text(issuer, './/issuerName')

            # Extract transaction information
            transactions = []
            for non_derivative_tx in root.findall('.//nonDerivativeTransaction'):
                tx = self._parse_transaction(non_derivative_tx)
                if tx:
                    transactions.append(tx)

            # If no regular transactions, try derivative transactions
            if not transactions:
                for derivative_tx in root.findall('.//derivativeTransaction'):
                    tx = self._parse_transaction(derivative_tx, is_derivative=True)
                    if tx:
                        transactions.append(tx)

            # Get the filing date
            filing_date_elem = root.find('.//periodOfReport')
            filing_date = filing_date_elem.text if filing_date_elem is not None else ""

            # Build result for each transaction
            results = []
            for tx in transactions:
                result = {
                    "filing_date": filing_date,
                    "ticker": ticker or "N/A",
                    "company_name": company_name or "N/A",
                    "officer_name": owner_name or "N/A",
                    "officer_title": officer_title or "N/A",
                    "is_director": is_director,
                    "is_officer": is_officer,
                    "trade_type": tx["trade_type"],
                    "shares": tx["shares"],
                    "price_per_share": tx["price"],
                    "total_value": tx["shares"] * tx["price"],
                    "transaction_code": tx["transaction_code"],
                    "sec_filing_url": filing_url,
                    "is_derivative": tx.get("is_derivative", False)
                }
                results.append(result)

            return results[0] if len(results) == 1 else results

        except Exception as e:
            logger.error(f"Error parsing Form 4 XML: {e}")
            return None

    def _parse_transaction(self, transaction_elem, is_derivative: bool = False) -> Optional[Dict]:
        """Parse a single transaction from Form 4 XML."""
        try:
            # Get transaction code (P = Purchase, S = Sale, etc.)
            tx_code = self._get_xml_text(transaction_elem, './/transactionCode')

            # Determine trade type
            trade_type = self._get_trade_type(tx_code)

            # Get shares/units
            shares_text = self._get_xml_text(transaction_elem, './/transactionShares/value')
            shares = float(shares_text) if shares_text else 0

            # Get price per share
            price_text = self._get_xml_text(transaction_elem, './/transactionPricePerShare/value')
            price = float(price_text) if price_text else 0

            # Skip if no price or shares (often means it's a grant or option exercise)
            if price == 0 or shares == 0:
                return None

            return {
                "transaction_code": tx_code,
                "trade_type": trade_type,
                "shares": int(shares),
                "price": round(price, 2),
                "is_derivative": is_derivative
            }
        except Exception as e:
            logger.warning(f"Error parsing transaction: {e}")
            return None

    @staticmethod
    def _get_xml_text(root, xpath: str) -> str:
        """Safely extract text from XML element."""
        elem = root.find(xpath)
        return elem.text.strip() if elem is not None and elem.text else ""

    @staticmethod
    def _get_trade_type(transaction_code: str) -> str:
        """Convert SEC transaction code to human-readable trade type."""
        buy_codes = ['P', 'A']  # P = Open market purchase, A = Award/grant purchase
        sell_codes = ['S', 'D']  # S = Open market sale, D = Sale to issuer

        if transaction_code in buy_codes:
            return "Buy"
        elif transaction_code in sell_codes:
            return "Sell"
        else:
            return "Other"

    def process_all_filings(self, days: int = 7, min_value: float = 100000) -> List[Dict]:
        """
        Process all recent filings and filter for significant trades.

        Args:
            days: Number of days to look back
            min_value: Minimum trade value to include (default $100k)

        Returns:
            List of processed insider trades
        """
        # Get recent filings
        filings = self.get_recent_form4_filings(days)

        all_trades = []
        processed_count = 0

        logger.info(f"Processing {len(filings)} filings...")

        for i, filing in enumerate(filings):
            if i > 0 and i % 10 == 0:
                logger.info(f"Processed {i}/{len(filings)} filings...")

            details = self.get_filing_details(filing["filing_url"])

            if details:
                # Handle both single and multiple transactions
                if isinstance(details, list):
                    all_trades.extend(details)
                else:
                    all_trades.append(details)
                processed_count += 1

        logger.info(f"Successfully processed {processed_count} filings")
        logger.info(f"Total trades extracted: {len(all_trades)}")

        # Filter for significant trades
        filtered_trades = [
            trade for trade in all_trades
            if trade["total_value"] >= min_value and trade["trade_type"] in ["Buy", "Sell"]
        ]

        logger.info(f"Trades after filtering (>${min_value:,.0f}): {len(filtered_trades)}")

        # Sort by total value descending
        filtered_trades.sort(key=lambda x: x["total_value"], reverse=True)

        return filtered_trades

    def export_to_csv(self, trades: List[Dict], output_file: str = "insider_trades.csv"):
        """Export trades to CSV file."""
        if not trades:
            logger.warning("No trades to export")
            return

        output_path = Path(output_file)

        # Define CSV columns
        fieldnames = [
            "filing_date",
            "ticker",
            "company_name",
            "officer_name",
            "officer_title",
            "is_director",
            "is_officer",
            "trade_type",
            "shares",
            "price_per_share",
            "total_value",
            "transaction_code",
            "sec_filing_url"
        ]

        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(trades)

        logger.info(f"Exported {len(trades)} trades to {output_path}")

    def export_to_dataframe(self, trades: List[Dict]) -> pd.DataFrame:
        """Export trades to pandas DataFrame."""
        df = pd.DataFrame(trades)

        # Format columns
        if not df.empty:
            df['total_value'] = df['total_value'].apply(lambda x: f"${x:,.2f}")
            df['price_per_share'] = df['price_per_share'].apply(lambda x: f"${x:.2f}")
            df['shares'] = df['shares'].apply(lambda x: f"{x:,}")

        return df


def main():
    """Main entry point for the scraper."""
    parser = argparse.ArgumentParser(
        description="OneSig SEC Form 4 Insider Trade Scraper"
    )
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of days to look back for filings (default: 7)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="insider_trades.csv",
        help="Output CSV file path (default: insider_trades.csv)"
    )
    parser.add_argument(
        "--min-value",
        type=float,
        default=100000,
        help="Minimum trade value to include in USD (default: 100000)"
    )
    parser.add_argument(
        "--top",
        type=int,
        default=None,
        help="Only export top N trades by value (default: all)"
    )

    args = parser.parse_args()

    # Create scraper instance
    scraper = SECInsiderTradeScraper()

    # Process filings
    logger.info("=" * 60)
    logger.info("OneSig SEC Form 4 Insider Trade Scraper")
    logger.info("=" * 60)

    trades = scraper.process_all_filings(
        days=args.days,
        min_value=args.min_value
    )

    # Limit to top N if specified
    if args.top and args.top < len(trades):
        trades = trades[:args.top]
        logger.info(f"Limiting output to top {args.top} trades")

    # Export results
    if trades:
        scraper.export_to_csv(trades, args.output)

        # Print summary
        logger.info("\n" + "=" * 60)
        logger.info("TOP 10 TRADES BY VALUE")
        logger.info("=" * 60)

        for i, trade in enumerate(trades[:10], 1):
            logger.info(
                f"{i}. {trade['ticker']} - {trade['officer_name']}: "
                f"{trade['trade_type']} {trade['shares']:,} shares @ "
                f"${trade['price_per_share']:.2f} = ${trade['total_value']:,.2f}"
            )
    else:
        logger.warning("No trades found matching criteria")

    logger.info("\n" + "=" * 60)
    logger.info("Scraping complete!")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
