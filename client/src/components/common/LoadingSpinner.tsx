export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground text-sm font-medium">Đang tải...</p>
      </div>
    </div>
  );
}
