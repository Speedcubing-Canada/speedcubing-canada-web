import { screen } from "@testing-library/react";
import { renderWithProviders, i18n } from "../test/renderWithProviders";
import { Documents } from "./Documents";
import { DOCUMENT_TYPES } from "./documents";

describe("Documents page", () => {
  it("renders the heading, the officers link and every document section", () => {
    renderWithProviders(<Documents />);

    expect(
      screen.getByRole("heading", { name: i18n.t("documents.title") }),
    ).toBeInTheDocument();

    // The officers spreadsheet link moved here from the Organization page.
    expect(screen.getByText(i18n.t("officers.list"))).toBeInTheDocument();

    // Each document category subheader renders (a category label can coincide with a
    // document's own name, e.g. "By-laws", so allow more than one match).
    DOCUMENT_TYPES.forEach((type) => {
      expect(
        screen.getAllByText(i18n.t(`documents.${type}`)).length,
      ).toBeGreaterThan(0);
    });
  });
});
