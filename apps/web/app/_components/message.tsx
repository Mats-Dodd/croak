import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MessageComponent({
  avatarSrc,
  avatarFallback,
  name,
  message,
}: {
  avatarSrc: string;
  avatarFallback: string;
  name: string;
  message: string;
}) {
  return (
    <div className="flex items-center gap-2 text-custom-light-green">
      <Avatar>
        <AvatarImage src={avatarSrc} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
