import { Card, CardContent } from "@/components/ui/card";

interface AdSlotProps {
  position: string;
}

export default function AdSlot({ position }: AdSlotProps) {
  return (
    <Card className="border-dashed border-muted-foreground/30 bg-muted/30">
      <CardContent className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          【广告位 - {position}】此处可放置合规广告内容
        </p>
      </CardContent>
    </Card>
  );
}
