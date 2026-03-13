import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyDogPage from "../MyDogPage";
import MyMatchesPage from "../MyMatchesPage";
import { useAuth } from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("auth loading state pages", () => {
  it("renders loading UI for MyDogPage while auth is resolving", () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    render(
      <MemoryRouter>
        <MyDogPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading your dogs...")).toBeInTheDocument();
  });

  it("renders loading UI for MyMatchesPage while auth is resolving", () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    render(
      <MemoryRouter>
        <MyMatchesPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading your matches...")).toBeInTheDocument();
  });
});
