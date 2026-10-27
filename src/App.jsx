import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { BookmarksPage } from "./pages/BookmarksPage";
import { BookmarkDetailPage } from "./pages/BookmarkDetailPage";
import { BookmarkNewPage } from "./pages/BookmarkNewPage";
import { BookmarkEditPage } from "./pages/BookmarkEditPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/bookmarks/new" element={<BookmarkNewPage />} />
        <Route path="/bookmarks/:id" element={<BookmarkDetailPage />} />
        <Route path="/bookmarks/:id/edit" element={<BookmarkEditPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
