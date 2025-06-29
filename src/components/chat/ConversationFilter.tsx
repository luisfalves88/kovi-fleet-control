
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ConversationFilterProps {
  onFilterChange: (filter: string) => void;
  currentFilter: string;
  unreadCount?: number;
  mentionCount?: number;
}

export const ConversationFilter: React.FC<ConversationFilterProps> = ({
  onFilterChange,
  currentFilter,
  unreadCount = 0,
  mentionCount = 0
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <Select value={currentFilter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar conversas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="unread">
            <div className="flex items-center gap-2">
              Não lidas
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </SelectItem>
          <SelectItem value="mentions">
            <div className="flex items-center gap-2">
              Menções
              {mentionCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {mentionCount}
                </Badge>
              )}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
