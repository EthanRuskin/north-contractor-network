import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FolderOpen, Plus, Trash2, Upload, X, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

interface ProjectsManagerProps {
  contractorId: string;
}

const ProjectsManager = ({ contractorId }: ProjectsManagerProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, [contractorId]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('contractor_id', contractorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading projects",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0]; // Only take the first file

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `project-${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${contractorId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('contractor-galleries')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('contractor-galleries')
        .getPublicUrl(filePath);

      setNewProject(prev => ({
        ...prev,
        image_url: publicUrl
      }));

      toast({
        title: "Image uploaded",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0]; // Only take the first file

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `project-${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${contractorId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('contractor-galleries')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('contractor-galleries')
        .getPublicUrl(filePath);

      setEditImageUrl(publicUrl);

      toast({
        title: "Image uploaded",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const createProject = async () => {
    if (!newProject.title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a project title",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .insert({
          contractor_id: contractorId,
          title: newProject.title,
          description: newProject.description || null,
          image_url: newProject.image_url || null
        });

      if (error) throw error;

      toast({
        title: "Project created",
        description: "Your project has been added successfully",
      });

      setNewProject({ title: '', description: '', image_url: '' });
      setShowDialog(false);
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEditingProject = (project: Project) => {
    setEditingProject(project);
    setEditImageUrl(project.image_url || '');
  };

  const updateProject = async () => {
    if (!editingProject) return;

    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({
          image_url: editImageUrl || null
        })
        .eq('id', editingProject.id);

      if (error) throw error;

      toast({
        title: "Project updated",
        description: "Project image has been updated successfully",
      });

      setEditingProject(null);
      setEditImageUrl('');
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: "Project has been removed",
      });

      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error deleting project",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading projects...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Projects ({projects.length})
            </CardTitle>
            <CardDescription>
              Organize your work into project portfolios to showcase specific jobs
            </CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Project Title</label>
                  <Input
                    value={newProject.title}
                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Modern Kitchen Renovation"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the project, materials used, timeline, etc."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Project Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload a project photo to showcase your work
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      {uploading ? 'Uploading...' : 'Choose Image'}
                    </Button>
                  </div>
                  {newProject.image_url && (
                    <div className="mt-4">
                      <div className="relative inline-block">
                        <img
                          src={newProject.image_url}
                          alt="Project preview"
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => setNewProject(prev => ({ ...prev, image_url: '' }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={createProject} disabled={uploading}>
                    Create Project
                  </Button>
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No projects yet. Create your first project to showcase your work.
            </p>
            <Button onClick={() => setShowDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="relative group cursor-pointer" onClick={() => setSelectedProject(project)}>
                <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <FolderOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Delete button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  {/* Edit button */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-12 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingProject(project);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  
                  {/* Title overlay */}
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-3">
                    <h3 className="text-white font-semibold text-sm leading-tight">{project.title}</h3>
                  </div>
                </div>
                
                {/* Project info */}
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Project Details Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProject.title}</DialogTitle>
                {selectedProject.description && (
                  <p className="text-muted-foreground">{selectedProject.description}</p>
                )}
              </DialogHeader>
              <div className="mt-4">
                {selectedProject.image_url ? (
                  <img
                    src={selectedProject.image_url}
                    alt={selectedProject.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground bg-gray-100 rounded-lg">
                    <FolderOpen className="h-8 w-8 mr-2" />
                    No image for this project
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Project Image Dialog */}
      <Dialog open={!!editingProject} onOpenChange={() => {
        setEditingProject(null);
        setEditImageUrl('');
      }}>
        <DialogContent className="max-w-md">
          {editingProject && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Image - {editingProject.title}</DialogTitle>
                <p className="text-muted-foreground">Update the project image</p>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Project Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload a new project image
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      className="hidden"
                      id="edit-image-upload"
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => document.getElementById('edit-image-upload')?.click()}
                    >
                      {uploading ? 'Uploading...' : 'Choose Image'}
                    </Button>
                  </div>
                </div>

                {editImageUrl && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Preview</label>
                    <div className="relative inline-block">
                      <img
                        src={editImageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={updateProject} 
                  disabled={uploading}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingProject(null);
                    setEditImageUrl('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProjectsManager;