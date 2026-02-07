import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { List } from 'react-window';

interface TopAnimeByFavoritesProps {
  type: 'favorites';
  data: Array<{ anime_id: number; count: number; anime_name: string }>;
}

interface TopAnimeByRatingProps {
  type: 'rating';
  data: Array<{ anime_id: number; weighted: number; count: number }>;
}

type TopAnimeListProps = TopAnimeByFavoritesProps | TopAnimeByRatingProps;

export const TopAnimeList: React.FC<TopAnimeListProps> = ({ type, data }) => {
  const title = type === 'favorites' ? 'Топ-10 по избранному' : 'Топ-10 по рейтингу';
  const Icon = type === 'favorites' ? Heart : Star;

  // Row renderer for virtualized list
  const RowComponent = ({ 
    index, 
    style,
    ariaAttributes 
  }: { 
    index: number; 
    style: React.CSSProperties;
    ariaAttributes: {
      'aria-posinset': number;
      'aria-setsize': number;
      role: 'listitem';
    };
  }) => {
    const item = data[index];
    
    return (
      <div style={style} className="px-3" {...ariaAttributes}>
        <Link
          to={`/anime/${item.anime_id}`}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold group-hover:bg-[#ff0055] group-hover:text-white transition-colors">
            {index + 1}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate group-hover:text-[#ff0055] transition-colors">
              {type === 'favorites' 
                ? (item as TopAnimeByFavoritesProps['data'][0]).anime_name 
                : `Anime #${item.anime_id}`}
            </p>
          </div>

          <div className="flex-shrink-0 text-right">
            {type === 'favorites' ? (
              <div className="flex items-center gap-1 text-gray-400">
                <Heart size={14} />
                <span className="text-sm font-medium">
                  {(item as TopAnimeByFavoritesProps['data'][0]).count}
                </span>
              </div>
            ) : (
              <div className="text-gray-400">
                <div className="flex items-center gap-1">
                  <Star size={14} fill="#ff0055" stroke="#ff0055" />
                  <span className="text-sm font-medium text-white">
                    {(item as TopAnimeByRatingProps['data'][0]).weighted.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs mt-0.5">
                  {(item as TopAnimeByRatingProps['data'][0]).count} оценок
                </p>
              </div>
            )}
          </div>
        </Link>
      </div>
    );
  };

  // Calculate list height (max 10 items visible, 64px per item)
  const listHeight = Math.min(data.length * 64, 640);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} className="text-[#ff0055]" />
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Нет данных</p>
      ) : (
        <List
          rowComponent={RowComponent}
          rowCount={data.length}
          rowHeight={64}
          rowProps={{}}
          style={{ height: listHeight, width: '100%' }}
          className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
        />
      )}
    </div>
  );
};
