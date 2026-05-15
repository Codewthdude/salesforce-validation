import StatusBadge from './StatusBadge';

const ValidationRuleCard = ({ rule, onToggle }) => (
  <article className="flex min-h-[248px] flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="break-words text-lg font-bold text-gray-950">{rule.name}</h2>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          {rule.entityName || 'Account'}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <StatusBadge active={rule.active} />
        {rule.pendingChange ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Pending
          </span>
        ) : null}
      </div>
    </div>

    <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
      {rule.description || 'No description'}
    </p>

    <p className="mt-3 line-clamp-3 text-sm italic leading-6 text-gray-500">
      {rule.errorMessage || 'No error message configured'}
    </p>

    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-5">
      <span className="text-sm font-medium text-gray-700">
        {rule.active ? 'Enabled' : 'Disabled'}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={rule.active}
        aria-label={`${rule.active ? 'Deactivate' : 'Activate'} ${rule.name}`}
        onClick={() => onToggle(rule.id)}
        className={`focus-ring relative inline-flex h-7 w-12 items-center rounded-full transition duration-200 ${
          rule.active ? 'bg-salesforce-green' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition duration-200 ${
            rule.active ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  </article>
);

export default ValidationRuleCard;
