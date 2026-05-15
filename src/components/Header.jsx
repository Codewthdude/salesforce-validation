const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'SF';

const Header = ({ userInfo, instanceUrl, onLogout }) => (
  <header className="border-b border-gray-200 bg-white">
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex items-center gap-3">
        <img src="/salesforce-logo.svg" alt="Salesforce" className="h-10 w-14" />
        <div>
          <h1 className="text-lg font-semibold text-gray-950">
            Validation Rule Manager
          </h1>
          <p className="text-sm text-gray-500">Account object controls</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-salesforce-blue text-sm font-bold text-white">
            {getInitials(userInfo?.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {userInfo?.name || 'Salesforce User'}
            </p>
            <p className="truncate text-xs text-gray-500">{instanceUrl}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="focus-ring rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    </div>
  </header>
);

export default Header;
