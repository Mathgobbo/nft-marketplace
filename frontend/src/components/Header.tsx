import { Link } from "react-router-dom";
export const Header = () => {
  return (
    <header className="w-screen flex justify-between lg:px-8 px-4 border-b border-slate-200 shadow-sm h-20">
      <div className="flex items-center space-x-4">
        <Link to="/">
          <h1 className="font-bold text-lg">NFT Marketplace</h1>
        </Link>
        <Link to="/">Home</Link>
        <Link to="/profile">Profile</Link>
      </div>

      <div className="grid place-items-center">
        <button className="p-2 border-2 text-slate-600 border-slate-600 hover:text-white hover:bg-slate-600 font-semibold transition rounded-md">
          Connect Wallet
        </button>
      </div>
    </header>
  );
};
