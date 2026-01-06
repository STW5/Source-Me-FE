'use client';

import { useEffect, useState } from 'react';
import { profileService } from '@/services/profileService';
import { projectService } from '@/services/projectService';
import { authService } from '@/services/authService';
import { authToken } from '@/lib/auth';
import { SiteProfile } from '@/types/profile';
import { Project } from '@/types/project';

export default function Home() {
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    setIsAuthenticated(authToken.isAuthenticated());

    const fetchData = async () => {
      try {
        const [profileData, projectsData] = await Promise.all([
          profileService.getProfile(),
          projectService.getProjects()
        ]);
        setProfile(profileData);
        setProjects(projectsData);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshProjects = async () => {
    try {
      const projectsData = await projectService.getProjects();
      setProjects(projectsData);
    } catch (err) {
      console.error('Failed to refresh projects:', err);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return;

    try {
      await projectService.deleteProject(id);
      await refreshProjects();
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  const handleLogout = () => {
    authToken.remove();
    setIsAuthenticated(false);
    setEditMode(false);
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      // If already logged in, toggle edit mode
      setEditMode(!editMode);
    } else {
      // If not logged in, show login modal
      setShowLoginModal(true);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-600">{error || '프로필을 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="text-xl font-bold text-gray-900">{profile.displayName}</div>
            <div className="flex gap-6 items-center">
              <a href="#home" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <a href="#projects" className="text-gray-600 hover:text-gray-900 transition-colors">Projects</a>
              <a href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>

              {isAuthenticated ? (
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      editMode
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {editMode ? '편집 종료' : '편집'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  로그인
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Hello, I'm {profile.displayName}
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            {profile.headline}
          </p>
          <div className="flex justify-center gap-4">
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all hover:scale-105"
              >
                GitHub
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="px-8 py-3 bg-white text-gray-900 border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-all hover:scale-105"
              >
                Contact
              </a>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-center justify-center py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">About Me</h2>

          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{profile.displayName}</h3>
                <p className="text-lg text-gray-600 mb-4">{profile.headline}</p>
                <div className="prose prose-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{profile.bioMarkdown}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Information</h3>
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Email:</span>
                    <span className="text-gray-600">{profile.email}</span>
                  </div>
                )}

                <div className="pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Links</h4>
                  <div className="flex flex-col gap-2">
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        GitHub →
                      </a>
                    )}
                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        LinkedIn →
                      </a>
                    )}
                    {profile.resumeUrl && (
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Resume →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="min-h-screen flex items-center justify-center py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Projects</h2>
            {isAuthenticated && editMode && (
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + 새 프로젝트
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <p className="text-center text-gray-600">프로젝트가 없습니다.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-4xl">🚀</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                      {project.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{project.summary}</p>
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mb-4">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          GitHub →
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Demo →
                        </a>
                      )}
                    </div>
                    {(project.startedAt || project.endedAt) && (
                      <p className="text-xs text-gray-500 mb-3">
                        {project.startedAt && new Date(project.startedAt).toLocaleDateString('ko-KR')}
                        {project.endedAt && ` - ${new Date(project.endedAt).toLocaleDateString('ko-KR')}`}
                        {!project.endedAt && ' - 진행중'}
                      </p>
                    )}
                    {editMode && (
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex items-center justify-center py-20 bg-white">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Contact</h2>
          <p className="text-xl text-gray-600 mb-12">
            프로젝트 협업이나 궁금한 점이 있으시면 연락주세요!
          </p>

          <div className="flex justify-center gap-6">
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
              >
                <div className="text-4xl">📧</div>
                <span className="text-gray-700 font-medium">Email</span>
              </a>
            )}

            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
              >
                <div className="text-4xl">💻</div>
                <span className="text-gray-700 font-medium">GitHub</span>
              </a>
            )}

            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
              >
                <div className="text-4xl">💼</div>
                <span className="text-gray-700 font-medium">LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setIsAuthenticated(true);
            setShowLoginModal(false);
          }}
        />
      )}

      {/* Project Form Modal */}
      {showModal && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => {
            setShowModal(false);
            setEditingProject(null);
          }}
          onSave={async () => {
            await refreshProjects();
            setShowModal(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 {profile.displayName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function LoginModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(username, password);
      authToken.set(response.token);
      authToken.setUsername(response.username);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">관리자 로그인</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사용자명
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectFormModal({
  project,
  onClose,
  onSave,
}: {
  project: Project | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    slug: project?.slug || '',
    summary: project?.summary || '',
    contentMarkdown: '',
    startedAt: project?.startedAt || '',
    endedAt: project?.endedAt || '',
    isPublished: true,
    isFeatured: project?.isFeatured || false,
    featuredOrder: 0,
    githubUrl: project?.githubUrl || '',
    demoUrl: project?.demoUrl || '',
    tagNames: project?.tags?.map((tag) => tag.name) || [],
  });
  const [tagInput, setTagInput] = useState(
    project?.tags?.map((tag) => tag.name).join(', ') || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTagInput = (value: string) => {
    setTagInput(value);
    const tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    setFormData((prev) => ({ ...prev, tagNames: tags }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        ...formData,
        endedAt: formData.endedAt || null,
        githubUrl: formData.githubUrl || null,
        demoUrl: formData.demoUrl || null,
      };

      if (project) {
        await projectService.updateProject(project.id, data);
      } else {
        await projectService.createProject(data);
      }

      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {project ? '프로젝트 수정' : '새 프로젝트'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug * (URL 경로용, 예: my-project)
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              요약 *
            </label>
            <textarea
              required
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작일 *
              </label>
              <input
                type="date"
                required
                value={formData.startedAt}
                onChange={(e) => setFormData({ ...formData, startedAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료일 (진행중이면 비워두세요)
              </label>
              <input
                type="date"
                value={formData.endedAt}
                onChange={(e) => setFormData({ ...formData, endedAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub URL
            </label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demo URL
            </label>
            <input
              type="url"
              value={formData.demoUrl}
              onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => handleTagInput(e.target.value)}
              placeholder="예: React, Spring, AWS"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
            {formData.tagNames.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tagNames.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
              Featured 프로젝트로 표시
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
