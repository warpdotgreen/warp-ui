import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react"
import { toast } from "sonner";

export default function OrPasteOffer({
  requiredAssetsStr,
  onOfferSubmitted,
}: {
  requiredAssetsStr: string,
  onOfferSubmitted: (manualOffer: string) => Promise<void>
}) {
  const [offer, setOffer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitOffer = async (offerStr: string) => {
    setSubmitting(true);
    try {
      await onOfferSubmitted(offerStr);
    } finally {
      setSubmitting(false);
    }
  }

  const fillOfferField = async (offerStr: string) => {
    setOffer(offerStr);
    if(offerStr.match(/^offer1[a-z0-9]*$/)) {
      await submitOffer(offerStr);
    }
  }

  return (
    <div className="pt-4 pb-4">
      <p className="uppercase text-center text-lg text-zinc-700">--- Or ---</p>
      <div className="mt-4 p-4 border-2 rounded-lg">
        <p className="text-zinc-600 text-center text-lg pb-4">Generate offer manually</p>
        <p className="text-zinc-300">Offering: <span className="text-zinc-300">{requiredAssetsStr}</span></p>
        <p className="text-zinc-300">Requesting: (leave empty)</p>

        <div className="flex items-center h-12 w-full gap-2 mt-4">
          <Input
            type="text"
            placeholder="offer1..."
            className="text-xl h-full border-2"
            pattern="^offer1[a-z0-9]*$"
            value={offer}
            onChange={(e) => fillOfferField(e.target.value)}
          />
        </div>
        <Button
          disabled={submitting}
          className="w-full font-light mt-4 h-14 border-2 border-theme-purple bg-theme-black hover:bg-theme-purple text-theme-purple hover:text-primary hover:opacity-80 text-xl"
          onClick={async () => {
            try {
              await submitOffer(offer);
            } catch(_) {
              toast.error("Error while submitting offer");
            }
          }}
        >
          {submitting ? 'Submitting offer...' : 'Submit Offer'}
        </Button>
      </div>
    </div>
  );
}
