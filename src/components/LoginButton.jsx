const LoginButton = ({ onClick, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="focus-ring inline-flex w-full items-center justify-center gap-3 rounded-lg bg-salesforce-blue px-6 py-3.5 text-base font-semibold text-white shadow-soft transition hover:bg-[#005fb2] disabled:cursor-not-allowed disabled:opacity-60"
  >
    <img src="/salesforce-logo.svg" alt="" className="h-7 w-10" />
    Login with Salesforce
  </button>
);

export default LoginButton;
