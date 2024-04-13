export function MultiStepForm({
  sourceChainName,
  destinationChainName,
  activeStep,
  children,
}: {
  sourceChainName: string,
  destinationChainName: string,
  activeStep: number,
  children: React.ReactNode,
}) {
  const steps = [
    { text: `Send tokens on ${sourceChainName}`, icon: <FeeIcon />, iconText: "Fee" },
    { text: "Wait for transaction confirmation", icon: <ClockIcon />, iconText: "~18 min" },
    { text: `Claim tokens on ${destinationChainName}`, icon: <FeeIcon />, iconText: "Fee" },
  ]

  return (
    <div className="max-w-xl w-full mx-auto py-8 break-words">
      <div className="mx-auto border-zinc-700 rounded-lg border p-6 bg-zinc-900 space-y-6">
        {steps.map((step, index) => {
          return (
            <div key={index} className={`space-y-2 ${activeStep - 1 == index ? 'text-zinc-100' : 'text-zinc-500'}`}>
              <div className="flex justify-between items-center">
                <p className="text-lg font-medium">{index + 1}. {step.text}</p>
                <div className="flex">
                  {step.icon}
                  <span className="ml-1">{step.iconText}</span>
                </div>
              </div>
              <div className="mx-4">
                {activeStep - 1 == index && (
                  <div className="pt-2 pb-4">{children}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// https://heroicons.com/
function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

// https://heroicons.com/
function FeeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}
