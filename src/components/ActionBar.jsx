const Spinner = () => (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
);

const ActionBar = ({
  ruleCount,
  activeCount,
  inactiveCount,
  pendingCount,
  isFetching,
  isDeploying,
  onFetch,
  onEnableAll,
  onDisableAll,
  onDeploy,
}) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-sm font-medium text-gray-700">
        Showing {ruleCount} rules — {activeCount} active, {inactiveCount} inactive
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={onFetch}
          disabled={isFetching || isDeploying}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span aria-hidden="true">↻</span>
          {isFetching ? 'Fetching...' : 'Fetch Rules'}
        </button>
        <button
          type="button"
          onClick={onEnableAll}
          disabled={ruleCount === 0 || isDeploying}
          className="focus-ring rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Enable All
        </button>
        <button
          type="button"
          onClick={onDisableAll}
          disabled={ruleCount === 0 || isDeploying}
          className="focus-ring rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Disable All
        </button>
        <button
          type="button"
          onClick={onDeploy}
          disabled={pendingCount === 0 || isDeploying}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-salesforce-blue px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-[#005fb2] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeploying ? <Spinner /> : null}
          Deploy ({pendingCount} {pendingCount === 1 ? 'change' : 'changes'})
        </button>
      </div>
    </div>
  </section>
);

export default ActionBar;
