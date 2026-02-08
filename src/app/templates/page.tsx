import { DeckTemplate } from "@/components/templates/deck-template";
import { FenceTemplate } from "@/components/templates/fence-template";

export const metadata = {
  title: "Project Templates — LumberLens",
};

export default function TemplatesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Project Templates</h1>
        <p className="text-stone-500 mt-1">
          Configure your project and generate a complete material list with pricing
        </p>
      </div>

      <div className="space-y-8">
        <DeckTemplate />
        <FenceTemplate />
      </div>
    </div>
  );
}
