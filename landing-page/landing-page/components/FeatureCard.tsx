interface FeatureCardProps {
  emoji: string
  title: string
  description: string
}

export default function FeatureCard({ emoji, title, description }: FeatureCardProps) {
  return (
    <div className="card text-center group hover:scale-105 transition-transform duration-200">
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">
        {emoji}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  )
}
