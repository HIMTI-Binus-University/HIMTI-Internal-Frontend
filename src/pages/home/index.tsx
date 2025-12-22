function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to HIMTI Internal
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Internal documentation and knowledge management system
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
