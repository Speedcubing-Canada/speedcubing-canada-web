import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminContext } from "react-admin";
import { AdminDashboard } from "./AdminDashboard";
import { i18nProvider } from "../i18nProvider";
import { API_BASE_URL } from "./api";
import { User } from "../types";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("../httpClient", () => ({ default: { post } }));

const user = (...roles: string[]) => ({ roles }) as User;

// AdminDashboard uses react-admin's useTranslate/useNotify, which need an Admin context.
const renderDashboard = (u: User) =>
  render(
    <AdminContext i18nProvider={i18nProvider}>
      <AdminDashboard user={u} />
    </AdminContext>,
  );

describe("AdminDashboard maintenance section", () => {
  beforeEach(() => {
    post.mockReset();
  });

  it("recomputes championships once confirmed", async () => {
    post.mockResolvedValue({
      ok: true,
      data: { data: { championships: 152 } },
    });
    renderDashboard(user("GLOBAL_ADMIN"));

    fireEvent.click(
      screen.getByRole("button", { name: "Recompute championships" }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Confirm" }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(
        API_BASE_URL + "/admin/recompute_championships",
      ),
    );
  });

  it("reindexes users once confirmed", async () => {
    post.mockResolvedValue({ ok: true, data: { data: { users: 42 } } });
    renderDashboard(user("WEBMASTER"));

    fireEvent.click(screen.getByRole("button", { name: "Reindex users" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirm" }));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(API_BASE_URL + "/admin/reindex_users"),
    );
  });

  it("does not call the endpoint until confirmed", async () => {
    renderDashboard(user("GLOBAL_ADMIN"));

    fireEvent.click(
      screen.getByRole("button", { name: "Recompute championships" }),
    );
    await screen.findByRole("button", { name: "Confirm" });

    expect(post).not.toHaveBeenCalled();
  });

  it("disables every action for content-only roles", () => {
    for (const role of ["DIRECTOR", "COMMS"]) {
      const { unmount } = renderDashboard(user(role));
      for (const button of screen.getAllByRole("button")) {
        expect(button).toBeDisabled();
      }
      unmount();
    }
  });
});
