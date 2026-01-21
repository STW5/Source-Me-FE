'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navigation from '@/components/Navigation';
import { projectService } from '@/services/projectService';
import { authToken } from '@/lib/auth';
import { mediaService } from '@/services/mediaService';
import { Project } from '@/types/project';
import { PageResponse } from '@/types/common';
import { SingleFileUpload } from '@/components/FileUpload';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectPage, setProjectPage] = useState<PageResponse<Project> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setIsAuthenticated(authToken.isAuthenticated());
    fetchProjects();
  }, [currentPage, searchKeyword]);

  useEffect(() => {
    if (reorderMode) {
      const featured = projects
        .filter(p => p.isFeatured)
        .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
      setFeaturedProjects(featured);
    }
  }, [reorderMode, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const pageData = await projectService.searchProjects({
        keyword: searchKeyword || undefined,
        page: currentPage,
        size: 9,
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      setProjectPage(pageData);
      setProjects(pageData.content);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProjects = async () => {
    await fetchProjects();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(searchInput);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEditProject = async (project: Project) => {
    try {
      const detail = await projectService.getProject(project.id);
      setEditingProject(detail);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to fetch project detail:', err);
      alert('프로젝트 상세 정보를 불러오지 못했습니다.');
    }
  };

  const handleOpenDetail = async (projectId: number) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const detail = await projectService.getProject(projectId);
      setDetailProject(detail);
    } catch (err) {
      console.error('Failed to fetch project detail:', err);
      setDetailError('프로젝트 상세 정보를 불러오지 못했습니다.');
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFeaturedProjects((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    try {
      // 각 프로젝트의 새로운 순서를 업데이트
      for (let i = 0; i < featuredProjects.length; i++) {
        const project = featuredProjects[i];
        await projectService.updateProject(project.id, {
          ...project,
          featuredOrder: i,
        });
      }
      alert('순서가 저장되었습니다.');
      setReorderMode(false);
      await refreshProjects();
    } catch (err) {
      console.error('Failed to save order:', err);
      alert('순서 저장에 실패했습니다.');
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-20 pt-20">
        <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Projects</h1>
          {isAuthenticated && (
            <div className="flex gap-2 md:gap-3 items-center">
              <button
                onClick={() => {
                  setEditMode(!editMode);
                  setReorderMode(false);
                }}
                className={`px-2.5 py-1.5 md:px-3 md:py-1.5 text-xs md:text-sm rounded-lg transition-colors ${
                  editMode
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {editMode ? '편집 종료' : '편집'}
              </button>
              <button
                onClick={() => {
                  setReorderMode(!reorderMode);
                  setEditMode(false);
                }}
                className={`px-2.5 py-1.5 md:px-3 md:py-1.5 text-xs md:text-sm rounded-lg transition-colors ${
                  reorderMode
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {reorderMode ? '순서 변경 종료' : '순서 변경'}
              </button>
              {editMode && (
                <button
                  onClick={handleCreateProject}
                  className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  + 새 프로젝트
                </button>
              )}
            </div>
          )}
        </div>

        <SearchBar
          searchInput={searchInput}
          searchKeyword={searchKeyword}
          totalElements={projectPage?.totalElements || 0}
          onSearchInputChange={setSearchInput}
          onSearch={handleSearch}
          onClear={() => {
            setSearchInput('');
            setSearchKeyword('');
            setCurrentPage(0);
          }}
        />

        {reorderMode ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Featured 프로젝트 순서 변경</h2>
              <p className="text-sm text-gray-600 mb-4">
                Featured로 설정된 프로젝트만 순서를 변경할 수 있습니다. 드래그하여 순서를 바꾸세요.
              </p>
            </div>
            {featuredProjects.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                Featured 프로젝트가 없습니다.
              </p>
            ) : (
              <>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={featuredProjects.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {featuredProjects.map((project, index) => (
                        <SortableProjectItem
                          key={project.id}
                          project={project}
                          index={index}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleSaveOrder}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    순서 저장
                  </button>
                </div>
              </>
            )}
          </div>
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-600">
            {searchKeyword ? '검색 결과가 없습니다.' : '프로젝트가 없습니다.'}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  editMode={editMode}
                  onOpenDetail={handleOpenDetail}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {projectPage && projectPage.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                projectPage={projectPage}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
        </div>

        {showDetailModal && (
          <ProjectDetailModal
            project={detailProject}
            loading={detailLoading}
            error={detailError}
            isAuthenticated={isAuthenticated}
            onClose={() => {
              setShowDetailModal(false);
              setDetailProject(null);
              setDetailError(null);
            }}
            onEdit={(project) => {
              setShowDetailModal(false);
              handleEditProject(project);
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
      </div>
    </>
  );
}

function SearchBar({
  searchInput,
  searchKeyword,
  totalElements,
  onSearchInputChange,
  onSearch,
  onClear,
}: {
  searchInput: string;
  searchKeyword: string;
  totalElements: number;
  onSearchInputChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onClear: () => void;
}) {
  return (
    <form onSubmit={onSearch} className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          placeholder="프로젝트 검색 (제목, 요약, 태그)..."
          className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 sm:flex-none px-4 md:px-6 py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            검색
          </button>
          {searchKeyword && (
            <button
              type="button"
              onClick={onClear}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm md:text-base bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              초기화
            </button>
          )}
        </div>
      </div>
      {searchKeyword && (
        <p className="mt-2 text-sm text-gray-600">
          "{searchKeyword}" 검색 결과: {totalElements}개
        </p>
      )}
    </form>
  );
}

function ProjectCard({
  project,
  editMode,
  onOpenDetail,
  onEdit,
  onDelete,
  formatDate,
}: {
  project: Project;
  editMode: boolean;
  onOpenDetail: (id: number) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  formatDate: (date?: string) => string;
}) {
  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
      onClick={() => onOpenDetail(project.id)}
    >
      <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
        {project.thumbnailMedia ? (
          <img
            src={mediaService.getMediaUrl(project.thumbnailMedia) || ''}
            alt={`${project.title} 썸네일`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-4xl">🚀</span>
        )}
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
              onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Demo →
            </a>
          )}
        </div>
        {(project.startedAt || project.endedAt) && (
          <p className="text-xs text-gray-500 mb-3">
            {project.startedAt && formatDate(project.startedAt)}
            {project.endedAt && ` - ${formatDate(project.endedAt)}`}
            {!project.endedAt && ' - 진행중'}
          </p>
        )}
        {editMode && (
          <div className="flex gap-2 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              수정
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id);
              }}
              className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  projectPage,
  onPageChange,
}: {
  currentPage: number;
  projectPage: PageResponse<Project>;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    return Array.from({ length: Math.min(5, projectPage.totalPages) }, (_, i) => {
      if (projectPage.totalPages <= 5) {
        return i;
      } else if (currentPage < 3) {
        return i;
      } else if (currentPage > projectPage.totalPages - 4) {
        return projectPage.totalPages - 5 + i;
      } else {
        return currentPage - 2 + i;
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-2 mt-8 md:mt-12">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={projectPage.first}
          className={`flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm md:text-base rounded-lg transition-colors ${
            projectPage.first
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          이전
        </button>

        <div className="flex gap-1">
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 md:w-10 md:h-10 text-sm md:text-base rounded-lg transition-colors ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {pageNum + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={projectPage.last}
          className={`flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm md:text-base rounded-lg transition-colors ${
            projectPage.last
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          다음
        </button>
      </div>

      <span className="text-xs md:text-sm text-gray-600">
        {currentPage + 1} / {projectPage.totalPages} 페이지
      </span>
    </div>
  );
}

function ProjectDetailModal({
  project,
  loading,
  error,
  isAuthenticated,
  onClose,
  onEdit,
}: {
  project: Project | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  onClose: () => void;
  onEdit: (project: Project) => void;
}) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMarkdown = (value?: string) => {
    if (!value) return null;
    const normalized = value.replace(/\n/g, '  \n');
    return (
      <div className="max-w-none text-gray-700 markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3" {...props} />,
            h4: ({node, ...props}) => <h4 className="text-base font-bold text-gray-900 mt-4 mb-2" {...props} />,
            p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
            li: ({node, ...props}) => <li className="ml-4" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
            code: ({node, ...props}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />,
          }}
        >
          {normalized}
        </ReactMarkdown>
      </div>
    );
  };

  const renderOwnedServices = (value?: string) => {
    if (!value) {
      return <p className="text-gray-900 font-medium">-</p>;
    }
    const services = value
      .split(',')
      .map((service) => service.trim())
      .filter(Boolean);
    if (services.length <= 1) {
      return <p className="text-gray-900 font-medium">{value}</p>;
    }
    return (
      <ul className="space-y-1 text-gray-900 font-medium">
        {services.map((service) => (
          <li key={service}>{service}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">프로젝트 상세</h2>
          <div className="flex items-center gap-3">
            {isAuthenticated && project && (
              <button
                onClick={() => onEdit(project)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all flex items-center gap-2 px-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="font-medium">수정</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto">
          {loading && (
            <div className="p-16 text-center">
              <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-6 text-lg text-gray-600 font-medium">프로젝트 정보를 불러오는 중...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          )}

          {!loading && !error && project && (
            <div className="p-8 space-y-10">
              {/* Hero Section */}
              <div className="space-y-6">
                {project.thumbnailMedia && (
                  <div className="w-full h-64 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={mediaService.getMediaUrl(project.thumbnailMedia) || ''}
                      alt={`${project.title} 썸네일`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {project.title}
                    </h3>
                    {project.isFeatured && (
                      <span className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-semibold shadow-md">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 text-xl leading-relaxed">{project.summary}</p>

                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 hover:shadow-md transition-shadow"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 text-base pt-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        GitHub
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Live Demo
                      </a>
                    )}
                  </div>

                  {(project.startedAt || project.endedAt) && (
                    <div className="flex items-center gap-2 text-base text-gray-600 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">
                        {project.startedAt && formatDate(project.startedAt)}
                        {project.endedAt && ` - ${formatDate(project.endedAt)}`}
                        {!project.endedAt && ' - 진행중'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid md:grid-cols-3 gap-5">
                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">팀 규모</p>
                  </div>
                  <p className="text-gray-900 font-bold text-lg">{project.teamSize || '-'}</p>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">역할</p>
                  </div>
                  <p className="text-gray-900 font-bold text-lg">{project.role || '-'}</p>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">담당 서비스</p>
                  </div>
                  <div className="text-gray-900 font-bold text-lg">{renderOwnedServices(project.ownedServices)}</div>
                </div>
              </div>

              {/* Content Sections */}
              {project.introductionMarkdown && (
                <section className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">프로젝트 소개</h4>
                  </div>
                  <div className="pl-2">{renderMarkdown(project.introductionMarkdown)}</div>
                </section>
              )}

              {project.responsibilitiesMarkdown && (
                <section className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">주요 개발 업무</h4>
                  </div>
                  <div className="pl-2">{renderMarkdown(project.responsibilitiesMarkdown)}</div>
                </section>
              )}

              {project.troubleshootingMarkdown && (
                <section className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">기술적 의사결정 & 트러블슈팅</h4>
                  </div>
                  <div className="pl-2">{renderMarkdown(project.troubleshootingMarkdown)}</div>
                </section>
              )}

              {project.contentMarkdown && (
                <section className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">추가 내용</h4>
                  </div>
                  <div className="pl-2">{renderMarkdown(project.contentMarkdown)}</div>
                </section>
              )}
            </div>
          )}
        </div>
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
    contentMarkdown: project?.contentMarkdown || '',
    startedAt: project?.startedAt || '',
    endedAt: project?.endedAt || '',
    isPublished: true,
    isFeatured: project?.isFeatured || false,
    featuredOrder: 0,
    githubUrl: project?.githubUrl || '',
    demoUrl: project?.demoUrl || '',
    teamSize: project?.teamSize || '',
    role: project?.role || '',
    ownedServices: project?.ownedServices || '',
    introductionMarkdown: project?.introductionMarkdown || '',
    responsibilitiesMarkdown: project?.responsibilitiesMarkdown || '',
    troubleshootingMarkdown: project?.troubleshootingMarkdown || '',
    tagNames: project?.tags?.map((tag) => tag.name) || [],
    thumbnailMediaId: project?.thumbnailMedia?.id ?? null,
  });
  const [tagInput, setTagInput] = useState(
    project?.tags?.map((tag) => tag.name).join(', ') || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      title: project?.title || '',
      slug: project?.slug || '',
      summary: project?.summary || '',
      contentMarkdown: project?.contentMarkdown || '',
      startedAt: project?.startedAt || '',
      endedAt: project?.endedAt || '',
      isPublished: true,
      isFeatured: project?.isFeatured || false,
      featuredOrder: project?.featuredOrder || 0,
      githubUrl: project?.githubUrl || '',
      demoUrl: project?.demoUrl || '',
      teamSize: project?.teamSize || '',
      role: project?.role || '',
      ownedServices: project?.ownedServices || '',
      introductionMarkdown: project?.introductionMarkdown || '',
      responsibilitiesMarkdown: project?.responsibilitiesMarkdown || '',
      troubleshootingMarkdown: project?.troubleshootingMarkdown || '',
      tagNames: project?.tags?.map((tag) => tag.name) || [],
      thumbnailMediaId: project?.thumbnailMedia?.id ?? null,
    });
    setTagInput(project?.tags?.map((tag) => tag.name).join(', ') || '');
  }, [project]);

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

  const handleThumbnailUpload = (file: { id: number }) => {
    setFormData((prev) => ({ ...prev, thumbnailMediaId: file.id }));
  };

  const handleThumbnailClear = () => {
    setFormData((prev) => ({ ...prev, thumbnailMediaId: null }));
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 썸네일
            </label>
            <SingleFileUpload
              onUpload={handleThumbnailUpload}
              onError={(err) => setError(err)}
              currentFile={project?.thumbnailMedia ?? null}
              accept="image/*"
              onClear={handleThumbnailClear}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                팀 규모
              </label>
              <input
                type="text"
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                역할
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              담당 서비스
            </label>
            <input
              type="text"
              value={formData.ownedServices}
              onChange={(e) => setFormData({ ...formData, ownedServices: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
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
              프로젝트 소개 (Markdown)
            </label>
            <textarea
              rows={4}
              value={formData.introductionMarkdown}
              onChange={(e) =>
                setFormData({ ...formData, introductionMarkdown: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              주요 개발 업무 (Markdown)
            </label>
            <textarea
              rows={5}
              value={formData.responsibilitiesMarkdown}
              onChange={(e) =>
                setFormData({ ...formData, responsibilitiesMarkdown: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              기술적 의사결정 & 트러블슈팅 (Markdown)
            </label>
            <textarea
              rows={6}
              value={formData.troubleshootingMarkdown}
              onChange={(e) =>
                setFormData({ ...formData, troubleshootingMarkdown: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              추가 내용 (Markdown)
            </label>
            <textarea
              rows={4}
              value={formData.contentMarkdown}
              onChange={(e) =>
                setFormData({ ...formData, contentMarkdown: e.target.value })
              }
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

          {formData.isFeatured && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                표시 순서
              </label>
              <input
                type="number"
                min="0"
                value={formData.featuredOrder}
                onChange={(e) => setFormData({ ...formData, featuredOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                낮은 숫자일수록 먼저 표시됩니다
              </p>
            </div>
          )}

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

function SortableProjectItem({ project, index }: { project: Project; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 cursor-move hover:shadow-lg transition-shadow"
      {...attributes}
      {...listeners}
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
          {index + 1}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
        <p className="text-sm text-gray-600 truncate">{project.summary}</p>
      </div>
      <div className="flex-shrink-0 text-gray-400">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
    </div>
  );
}
