import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DropZone } from "@/components/DropZone";

describe("DropZone", () => {
  it("renders upload prompt", () => {
    render(<DropZone onFiles={vi.fn()} />);
    expect(screen.getByText(/drag & drop pdfs/i)).toBeInTheDocument();
  });

  it("rejects non-PDF files", () => {
    const onFiles = vi.fn();
    render(<DropZone onFiles={onFiles} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const txtFile = new File(["content"], "test.txt", { type: "text/plain" });
    Object.defineProperty(input, "files", { value: [txtFile] });
    fireEvent.change(input);
    expect(onFiles).not.toHaveBeenCalled();
  });

  it("accepts valid PDF files", () => {
    const onFiles = vi.fn();
    render(<DropZone onFiles={onFiles} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const pdfFile = new File(["pdf content"], "test.pdf", { type: "application/pdf" });
    Object.defineProperty(input, "files", { value: [pdfFile] });
    fireEvent.change(input);
    expect(onFiles).toHaveBeenCalledWith([pdfFile]);
  });

  it("rejects oversized files", () => {
    const onFiles = vi.fn();
    render(<DropZone onFiles={onFiles} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const bigFile = new File(["x".repeat(1)], "big.pdf", { type: "application/pdf" });
    Object.defineProperty(bigFile, "size", { value: 60 * 1024 * 1024 });
    Object.defineProperty(input, "files", { value: [bigFile] });
    fireEvent.change(input);
    expect(onFiles).not.toHaveBeenCalled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<DropZone onFiles={vi.fn()} disabled />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });
});
