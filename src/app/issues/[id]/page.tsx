'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToIssue, updateIssueStatus, deleteIssue } from '@/services/issueService';
import {
  subscribeToComments,
  addComment,
  subscribeToStatusUpdates,
  addStatusUpdate,
} from '@/services/commentService';
import { Issue, Comment, StatusUpdate, IssueStatus } from '@/types';
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from '@/lib/constants';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import LocationPicker from '@/components/features/LocationPicker';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  MapPin,
  MessageSquare,
  Send,
  User,
  CheckCircle,
  AlertTriangle,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const issueId = params.id as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState<IssueStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAllUpdates, setShowAllUpdates] = useState(false);

  const MAX_VISIBLE_UPDATES = 4; // + 1 for the creation event = 5 total

  useEffect(() => {
    if (!issueId) return;

    const unsubIssue = subscribeToIssue(issueId, (data) => {
      setIssue(data);
      setLoading(false);
    });

    const unsubComments = subscribeToComments(issueId, setComments);
    const unsubStatus = subscribeToStatusUpdates(issueId, setStatusUpdates);

    return () => {
      unsubIssue();
      unsubComments();
      unsubStatus();
    };
  }, [issueId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !profile) return;

    setSubmittingComment(true);
    try {
      await addComment(issueId, user.uid, profile.displayName, profile.role, newComment, profile.photoUrl);
      setNewComment('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !user || !profile || !issue) return;

    setUpdatingStatus(true);
    try {
      await updateIssueStatus(issueId, newStatus);
      await addStatusUpdate(
        issueId,
        issue.status,
        newStatus,
        user.uid,
        profile.displayName,
        statusNote || `Status changed to ${newStatus}`
      );
      setNewStatus('');
      setStatusNote('');
      toast.success('Status updated successfully');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteIssue(issueId);
      toast.success('Report deleted successfully');
      router.push('/admin/issues');
    } catch {
      toast.error('Failed to delete report');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!issue) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Issue not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The issue you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    );
  }

  const category = ISSUE_CATEGORIES.find((c) => c.value === issue.category);
  const isAdmin = profile?.role === 'admin';

  const getStatusDotColor = (status: IssueStatus) => {
    switch (status) {
      case 'pending': return 'bg-purple-500';
      case 'verified': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'invalid': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  // Show-more logic for status updates
  const visibleUpdates = showAllUpdates
    ? statusUpdates
    : statusUpdates.slice(0, MAX_VISIBLE_UPDATES);
  const hiddenCount = statusUpdates.length - MAX_VISIBLE_UPDATES;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={isAdmin ? '/admin/issues' : '/my-reports'}
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4"
      >
        <ArrowLeft size={16} />
        Back to {isAdmin ? 'All Issues' : 'My Reports'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Header */}
          <Card>
            <CardBody className="space-y-4">
              {issue.priority === 'emergency' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                  <AlertTriangle size={18} />
                  <span className="font-medium text-sm">Emergency Priority Issue</span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{category?.icon}</span>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {category?.label || issue.category}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status={issue.status} />
                    <PriorityBadge priority={issue.priority} />
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {format(new Date(issue.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>

              {issue.imageUrl && (
                <div className="relative w-full h-64 border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                  <Image src={issue.imageUrl} alt="Issue" fill className="object-cover" />
                </div>
              )}

              {issue.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{issue.description}</p>
                </div>
              )}

              {issue.voiceUrl && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voice Note</h3>
                  <audio src={issue.voiceUrl} controls className="w-full" />
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <User size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">{issue.userName}</p>
                  <p className="text-gray-500 dark:text-gray-400">{issue.userEmail}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin size={18} />
                Location
              </h2>
            </CardHeader>
            <CardBody>
              <LocationPicker
                initialLat={issue.locationLat}
                initialLng={issue.locationLng}
                readOnly
                onLocationSelect={() => {}}
              />
              {issue.locationAddress && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{issue.locationAddress}</p>
              )}
            </CardBody>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} />
                Comments ({comments.length})
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {comments.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No comments yet</p>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  {comment.userPhotoURL ? (
                    <div className="w-8 h-8 relative rounded-full overflow-hidden flex-shrink-0">
                      <Image src={comment.userPhotoURL} alt={comment.userName} fill className="object-cover" />
                    </div>
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        comment.userRole === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}
                    >
                      <User
                        size={14}
                        className={comment.userRole === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.userName}
                      </span>
                      {comment.userRole === 'admin' && (
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}

              {user && (
                <form onSubmit={handleAddComment} className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <Button type="submit" size="sm" loading={submittingComment} disabled={!newComment.trim()}>
                    <Send size={14} />
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Admin Actions: Status Update + Delete */}
          {isAdmin && (
            <>
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Update Status</h2>
                </CardHeader>
                <CardBody className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select new status</option>
                    {ISSUE_STATUSES.filter((s) => s.value !== issue.status).map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Add a note about this update..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400 dark:placeholder-gray-500"
                    rows={3}
                  />
                  <Button
                    onClick={handleStatusUpdate}
                    loading={updatingStatus}
                    disabled={!newStatus}
                    className="w-full"
                  >
                    <CheckCircle size={16} />
                    Update Status
                  </Button>
                </CardBody>
              </Card>

              {/* Delete Report */}
              <Card>
                <CardBody>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete Report
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium text-center">
                        Are you sure? This action cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {deleting ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </>
          )}

          {/* Status Timeline with Show More */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900 dark:text-white">Status History</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {/* Creation event */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    {(visibleUpdates.length > 0) && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-600 mt-1" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Issue Created</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(issue.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {visibleUpdates.map((update, i) => (
                  <div key={update.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 ${getStatusDotColor(update.newStatus)} rounded-full`} />
                      {i < visibleUpdates.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-600 mt-1" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        <StatusBadge status={update.previousStatus} />
                        <span className="mx-1">→</span>
                        <StatusBadge status={update.newStatus} />
                      </p>
                      {update.note && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{update.note}</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        by {update.updatedByName} •{' '}
                        {format(new Date(update.createdAt), 'MMM d, h:mm a')}
                        {' · '}
                        {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Show more / Show less toggle */}
                {hiddenCount > 0 && (
                  <button
                    onClick={() => setShowAllUpdates(!showAllUpdates)}
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors ml-6"
                  >
                    {showAllUpdates ? (
                      <>
                        <ChevronUp size={14} />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        Show more ({hiddenCount} more update{hiddenCount !== 1 ? 's' : ''})
                      </>
                    )}
                  </button>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Issue Details */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900 dark:text-white">Details</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <DetailRow label="Category" value={`${category?.icon} ${category?.label}`} />
              <DetailRow label="Priority">
                <PriorityBadge priority={issue.priority} />
              </DetailRow>
              <DetailRow label="Status">
                <StatusBadge status={issue.status} />
              </DetailRow>
              <DetailRow
                label="Location"
                value={`${issue.locationLat.toFixed(4)}, ${issue.locationLng.toFixed(4)}`}
              />
              <DetailRow
                label="Reported"
                value={format(new Date(issue.createdAt), 'MMM d, yyyy')}
              />
              <DetailRow
                label="Last Updated"
                value={format(new Date(issue.updatedAt), 'MMM d, yyyy')}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      {children || <span className="text-gray-900 dark:text-white font-medium">{value}</span>}
    </div>
  );
}
