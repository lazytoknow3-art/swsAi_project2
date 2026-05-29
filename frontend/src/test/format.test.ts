import { describe, it, expect } from "vitest";
import { formatFileSize, formatRelativeTime } from "@/utils/format";

describe("formatFileSize", () => {
  it("formats bytes", () => expect(formatFileSize(500)).toBe("500 B"));
  it("formats kilobytes", () => expect(formatFileSize(1536)).toBe("1.5 KB"));
  it("formats megabytes", () => expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB"));
  it("handles zero", () => expect(formatFileSize(0)).toBe("0 B"));
});

describe("formatRelativeTime", () => {
  it("returns 'just now' for recent times", () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago");
  });
});
