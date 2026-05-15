import ValidationRuleCard from './ValidationRuleCard';

const SkeletonCard = () => (
  <div className="min-h-[248px] animate-pulse rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex justify-between gap-4">
      <div className="h-6 w-2/3 rounded bg-gray-200" />
      <div className="h-6 w-20 rounded-full bg-gray-200" />
    </div>
    <div className="mt-6 space-y-3">
      <div className="h-4 rounded bg-gray-200" />
      <div className="h-4 w-5/6 rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
    </div>
    <div className="mt-8 h-10 rounded bg-gray-100" />
  </div>
);

const RulesList = ({ rules, isLoading, error, onRetry, onToggle }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-950">Unable to load rules</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring mt-5 rounded-lg bg-salesforce-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005fb2]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-950">No Account validation rules found</h2>
        <p className="mt-2 text-sm text-gray-600">
          Create validation rules on the Account object in Salesforce, then fetch again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring mt-5 rounded-lg bg-salesforce-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005fb2]"
        >
          Fetch Rules
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {rules.map((rule) => (
        <ValidationRuleCard key={rule.id} rule={rule} onToggle={onToggle} />
      ))}
    </div>
  );
};

export default RulesList;
