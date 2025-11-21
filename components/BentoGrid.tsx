import { ReactNode } from 'react'

const BentoGrid = ({ children }: { children: ReactNode }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 h-[calc(100vh-4rem)] overflow-hidden">
            {children}
        </div>
    )
}

export const BentoItem = ({
    children,
    className = "",
    colSpan = "col-span-1",
    rowSpan = "row-span-1"
}: {
    children: ReactNode;
    className?: string;
    colSpan?: string;
    rowSpan?: string;
}) => {
    return (
        <div className={`${colSpan} ${rowSpan} glass-panel rounded-xl overflow-hidden flex flex-col ${className}`}>
            {children}
        </div>
    )
}

export default BentoGrid
