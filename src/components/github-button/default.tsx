import { GithubButton } from "@/components/ui/github-button";

export default function Component() {
  return (
    <div className="space-y-4">
      <GithubButton
        label="Star on GitHub"
        repoUrl="https://github.com/puiusabin/blanc"
      />
    </div>
  );
}
