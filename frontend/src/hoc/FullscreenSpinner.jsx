const FullscreenSpinner = () => {
  return (
    <div className="fixed inset-0 grid place-items-center bg-background">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-3 animate-ping rounded-full bg-primary" />
        Loading...
      </div>
    </div>
  );
};

export default FullscreenSpinner;
