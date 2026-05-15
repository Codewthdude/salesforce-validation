const StatusBadge = ({ active }) => (
  <span
    className={
      active
        ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800'
        : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600'
    }
  >
    {active ? 'Active' : 'Inactive'}
  </span>
);

export default StatusBadge;
