import { Link } from 'react-router-dom'
import { Home as HomeIcon, Search } from 'lucide-react'

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#ff0055] mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-2">
            Страница не найдена
          </h2>
          <p className="text-gray-400 text-lg">
            К сожалению, запрашиваемая страница не существует или была удалена
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ff0055] text-white rounded-lg hover:bg-[#cc0044] transition-colors"
          >
            <HomeIcon size={20} />
            На главную
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Search size={20} />
            Искать аниме
          </Link>
        </div>

        <div className="mt-12 text-gray-500 text-sm">
          <p>Попробуйте вернуться на главную страницу или воспользуйтесь поиском</p>
        </div>
      </div>
    </div>
  )
}
