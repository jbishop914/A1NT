import { Phone } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function AIReceptionistPage() {
  return (
    <ModulePlaceholder
      title="AI Receptionist & Phone System"
      description="Never miss a call. Never lose a lead. 24/7 intelligent intake."
      icon={Phone}
      priority="P2"
      features={[
        "AI voice agent — answers, captures info, classifies intent",
        "Smart call routing by department/intent",
        "Work order creation from phone calls",
        "Appointment booking via phone",
        "After-hours handling and callback scheduling",
        "Call transcription with searchable archive",
        "Live call dashboard — active calls, queue, wait times",
        "Voicemail-to-text with priority flagging",
      ]}
    />
  );
}
