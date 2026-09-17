import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationProvider, useNotification } from "@/components/Notification";

function NotificationHarness() {
  const { notify } = useNotification();
  return (
    <>
      <button onClick={() => notify("Saved", "success")}>Notify success</button>
      <button onClick={() => notify("Failed", "error")}>Notify error</button>
    </>
  );
}

describe("NotificationProvider", () => {
  it("shows the newest notification and replaces the previous one", () => {
    vi.useFakeTimers();
    render(
      <NotificationProvider>
        <NotificationHarness />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Notify success" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Saved");

    fireEvent.click(screen.getByRole("button", { name: "Notify error" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
    expect(screen.getByRole("alert")).not.toHaveTextContent("Saved");

    act(() => vi.advanceTimersByTime(3350));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
