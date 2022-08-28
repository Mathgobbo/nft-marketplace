import { useWeb3 } from "../context/Web3ContextProvider";

export const ErrorBanner = () => {
  const { error } = useWeb3();
  return (
    <div className="absolute inset-x-0 bottom-0 overflow-hidden">
      <section
        className={`text-xl overflow-hidden text-white transition ${
          !error ? "translate-y-20" : "translate-y-0"
        } font-semibold min-h-[4rem] p-2 m-4 grid place-items-center rounded-md bg-red-600`}
      >
        Error: {error?.message}
      </section>
    </div>
  );
};
