import { Button } from "./Button";

export function ErrorState({ message = "요청에 실패했습니다. 다시 시도하세요.", onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}
