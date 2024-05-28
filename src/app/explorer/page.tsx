import Header from "../landingPageComponents/Header";
import { MessageSection } from "./components/MessageSection";

export default function Explorer() {
  return (
    <>
      <Header />
      <div className="mt-16 pt-8 mb-8 text-4xl w-full text-center">Message Explorer</div>
      <MessageSection sent={true} />
      <div className="mt-16">
        <MessageSection sent={false} />
      </div>
    </>
  );
}
