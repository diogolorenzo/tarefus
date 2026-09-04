import type { User } from '../types';

export interface AssigneeOption {
  user: User;
  isSelected: boolean;
  isInactive: boolean;
}

interface GetVisibleAssigneesInput {
  users: User[];
  selectedIds: string[];
  currentUserId?: string;
  query: string;
}

export const getVisibleAssignees = ({
  users,
  selectedIds,
  currentUserId,
  query,
}: GetVisibleAssigneesInput): AssigneeOption[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const selectedSet = new Set(selectedIds);

  return users
    .filter((user) => user.status !== 'inactive' || selectedSet.has(user.id))
    .filter((user) => {
      if (!normalizedQuery) return true;
      return [user.name, user.email, user.role].some((value) =>
        value.toLocaleLowerCase().includes(normalizedQuery)
      );
    })
    .map((user) => ({
      user,
      isSelected: selectedSet.has(user.id),
      isInactive: user.status === 'inactive',
    }))
    .sort((left, right) => {
      if (left.isSelected !== right.isSelected) return left.isSelected ? -1 : 1;
      const leftIsCurrent = left.user.id === currentUserId;
      const rightIsCurrent = right.user.id === currentUserId;
      if (leftIsCurrent !== rightIsCurrent) return leftIsCurrent ? -1 : 1;
      return left.user.name.localeCompare(right.user.name, 'pt-BR');
    });
};

export const toggleAssignee = (selectedIds: string[], userId: string): string[] => {
  return selectedIds.includes(userId)
    ? selectedIds.filter((id) => id !== userId)
    : [...selectedIds, userId];
};

export const getAssigneeSelectionSummary = (users: User[], selectedIds: string[]) => {
  const selectedUsers = selectedIds
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is User => Boolean(user));

  return {
    visible: selectedUsers.slice(0, 2),
    extraCount: Math.max(0, selectedUsers.length - 2),
  };
};
