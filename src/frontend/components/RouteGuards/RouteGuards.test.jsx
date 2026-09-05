import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RequireAuth, RequireAdmin } from './index';

const Protected = () => <div>受保護的內容</div>;
const Home = () => <div>首頁</div>;
const AdminLogin = () => <div>後台登入</div>;

const renderWithRouter = (initialPath, guarded) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path={initialPath} element={guarded} />
      </Routes>
    </MemoryRouter>
  );

describe('RequireAuth', () => {
  it('沒有 token 時導向首頁', () => {
    renderWithRouter('/member-center', <RequireAuth><Protected /></RequireAuth>);
    expect(screen.getByText('首頁')).toBeInTheDocument();
    expect(screen.queryByText('受保護的內容')).not.toBeInTheDocument();
  });

  it('有 token 時顯示內容', () => {
    localStorage.setItem('token', 'fake-token');
    renderWithRouter('/member-center', <RequireAuth><Protected /></RequireAuth>);
    expect(screen.getByText('受保護的內容')).toBeInTheDocument();
  });
});

describe('RequireAdmin', () => {
  it('沒有 admin token 時導向後台登入頁', () => {
    renderWithRouter('/admin/dashboard', <RequireAdmin><Protected /></RequireAdmin>);
    expect(screen.getByText('後台登入')).toBeInTheDocument();
  });

  it('角色為一般會員時導向後台登入頁', () => {
    localStorage.setItem('admin_token', 'fake-token');
    localStorage.setItem('admin_userRole', 'Member');
    renderWithRouter('/admin/dashboard', <RequireAdmin><Protected /></RequireAdmin>);
    expect(screen.getByText('後台登入')).toBeInTheDocument();
  });

  it.each(['ADMIN', 'ACTIVITY_MANAGER'])('角色為 %s 時顯示內容', (role) => {
    localStorage.setItem('admin_token', 'fake-token');
    localStorage.setItem('admin_userRole', role);
    renderWithRouter('/admin/dashboard', <RequireAdmin><Protected /></RequireAdmin>);
    expect(screen.getByText('受保護的內容')).toBeInTheDocument();
  });
});
