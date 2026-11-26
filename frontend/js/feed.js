// Feed CRUD uses the Supabase JavaScript client; PostgreSQL RLS enforces ownership.
let allPosts = [];
let activeFeedFilter = 'all';
let editingPostId = null;

// Wait for Supabase Auth before binding the protected feed.
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthenticated = await protectPage();
  if (!isAuthenticated) return;

  document.getElementById('post-form').addEventListener('submit', handleCreatePost);
  document.getElementById('post-text').addEventListener('input', (event) => {
    document.getElementById('post-character-count').textContent = `${event.target.value.length} / 5000`;
  });
  document.getElementById('edit-form').addEventListener('submit', handleUpdatePost);
  document.getElementById('edit-close').addEventListener('click', closeEditDialog);
  document.getElementById('edit-cancel').addEventListener('click', closeEditDialog);
  await loadFeed();
});

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function createAvatar(name, imageUrl, className = 'avatar') {
  const avatar = createElement('div', className, getInitials(name));
  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = `${name}'s profile image`;
    image.referrerPolicy = 'no-referrer';
    image.onerror = () => { image.remove(); avatar.textContent = getInitials(name); };
    avatar.replaceChildren(image);
  }
  return avatar;
}

function mapPost(row) {
  return {
    post_id: row.id,
    posted_user_id: row.user_id,
    posted_username: row.profiles?.username || 'A community member',
    posted_user_image: row.profiles?.avatar_url || null,
    posted_time: row.created_at,
    posted_text: row.content,
    posted_image_url: row.image_url
  };
}

async function loadFeed() {
  const feedList = document.getElementById('feed-list');
  const loadingState = document.getElementById('feed-loading');
  const emptyState = document.getElementById('feed-empty');
  loadingState.hidden = false;
  emptyState.hidden = true;
  feedList.replaceChildren();

  try {
    const { data, error } = await getSupabaseClient()
      .from('posts')
      .select('id, user_id, content, image_url, created_at, profiles!posts_user_id_fkey(username, avatar_url)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    allPosts = (data || []).map(mapPost);
    renderFeed();
    updateProfileStats();
  } catch (error) {
    showToast(error.message || 'Could not load the feed.');
    feedList.replaceChildren();
  } finally {
    loadingState.hidden = true;
  }
}

function renderFeed() {
  const feedList = document.getElementById('feed-list');
  const emptyState = document.getElementById('feed-empty');
  const title = document.getElementById('feed-title');
  const currentUser = getStoredUser();
  const postsToShow = activeFeedFilter === 'mine'
    ? allPosts.filter((post) => post.posted_user_id === currentUser.user_id)
    : allPosts;

  title.textContent = activeFeedFilter === 'mine' ? 'Your stories' : 'Fresh from the baksho';
  feedList.replaceChildren();
  if (postsToShow.length === 0) {
    emptyState.hidden = false;
    const heading = emptyState.querySelector('h3');
    const paragraph = emptyState.querySelector('p');
    heading.textContent = activeFeedFilter === 'mine' && allPosts.length > 0 ? 'No stories from you yet.' : "It's quiet in here.";
    paragraph.textContent = 'Your next note could be the first one. Start with something small.';
    return;
  }

  emptyState.hidden = true;
  postsToShow.forEach((post) => {
    const postCard = createPostCard(post, currentUser);
    feedList.appendChild(postCard);
    loadComments(post.post_id, postCard.querySelector('.comments-list'), postCard.querySelector('.comment-count'));
  });
}

function createPostCard(post, currentUser) {
  const postCard = createElement('article', 'post-card');
  const postHeader = createElement('div', 'post-head');
  const author = createElement('div', 'post-author');
  const authorAvatar = createAvatar(post.posted_username, post.posted_user_image, 'avatar');
  const authorInfo = createElement('div', 'post-author-info');
  authorInfo.append(
    createElement('strong', 'post-author-name', post.posted_username),
    createElement('span', 'post-time', calculateTimeDifference(post.posted_time))
  );
  author.append(authorAvatar, authorInfo);
  postHeader.appendChild(author);

  if (post.posted_user_id === currentUser.user_id) {
    const actions = createElement('div', 'post-owner-actions');
    const editButton = createElement('button', 'post-action', 'Edit');
    editButton.type = 'button';
    editButton.addEventListener('click', () => openEditDialog(post));
    const deleteButton = createElement('button', 'post-action delete', 'Delete');
    deleteButton.type = 'button';
    deleteButton.addEventListener('click', () => handleDeletePost(post.post_id));
    actions.append(editButton, deleteButton);
    postHeader.appendChild(actions);
  }

  postCard.append(postHeader, createElement('p', 'post-copy', post.posted_text));
  if (post.posted_image_url) {
    const postImage = document.createElement('img');
    postImage.className = 'post-image';
    postImage.src = post.posted_image_url;
    postImage.alt = 'Image shared with this story';
    postImage.loading = 'lazy';
    postImage.referrerPolicy = 'no-referrer';
    postImage.onerror = () => postImage.remove();
    postCard.appendChild(postImage);
  }

  postCard.appendChild(createElement('div', 'post-divider'));
  const commentsSection = createElement('section', 'post-comments');
  const commentsHeading = createElement('div', 'comments-heading');
  commentsHeading.append(createElement('span', '', 'CONVERSATION'), createElement('span', 'comment-count', '…'));
  const commentsList = createElement('div', 'comments-list');
  commentsList.dataset.postId = String(post.post_id);
  const commentForm = createElement('form', 'comment-form');
  const commentInput = document.createElement('input');
  commentInput.type = 'text';
  commentInput.name = 'comment_text';
  commentInput.maxLength = 1000;
  commentInput.placeholder = 'Leave a kind thought…';
  commentInput.setAttribute('aria-label', 'Write a comment');
  const commentButton = createElement('button', '', 'Comment');
  commentButton.type = 'submit';
  commentForm.append(commentInput, commentButton);
  commentForm.addEventListener('submit', (event) => handleAddComment(
    event, post.post_id, commentInput, commentsList, commentsHeading.querySelector('.comment-count')
  ));
  commentsSection.append(commentsHeading, commentsList, commentForm);
  postCard.appendChild(commentsSection);
  return postCard;
}

async function loadComments(postId, commentsList, countElement) {
  try {
    const { data, error } = await getSupabaseClient()
      .from('comments')
      .select('id, post_id, user_id, content, created_at, profiles!comments_user_id_fkey(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    const comments = data || [];
    countElement.textContent = `${comments.length} ${comments.length === 1 ? 'NOTE' : 'NOTES'}`;
    commentsList.replaceChildren();
    if (!comments.length) {
      commentsList.appendChild(createElement('p', 'no-comments', 'No replies just yet. You could start the conversation.'));
      return;
    }
    comments.forEach((comment) => commentsList.appendChild(createCommentRow({
      comment_id: comment.id,
      comments_of_post_id: comment.post_id,
      commented_user_id: comment.user_id,
      commented_username: comment.profiles?.username || 'Community member',
      commented_user_image: comment.profiles?.avatar_url || null,
      commented_time: comment.created_at,
      comment_text: comment.content
    })));
  } catch (error) {
    commentsList.replaceChildren(createElement('p', 'no-comments', 'Replies could not be loaded right now.'));
    console.error(`Could not load comments for post ${postId}:`, error);
  }
}

function createCommentRow(comment) {
  const currentUser = getStoredUser();
  const row = createElement('div', 'comment-row');
  const avatar = createAvatar(comment.commented_username, comment.commented_user_image, 'avatar comment-avatar');
  const body = createElement('div', 'comment-body');
  const meta = createElement('div', 'comment-meta');
  meta.append(
    createElement('strong', '', comment.commented_username),
    createElement('span', '', calculateTimeDifference(comment.commented_time))
  );
  body.append(meta, createElement('p', 'comment-text', comment.comment_text));
  if (comment.commented_user_id === currentUser.user_id) {
    const deleteButton = createElement('button', 'comment-delete', 'Remove');
    deleteButton.type = 'button';
    deleteButton.addEventListener('click', () => handleDeleteComment(comment.comment_id, comment.comments_of_post_id));
    meta.appendChild(deleteButton);
  }
  row.append(avatar, body);
  return row;
}

async function handleCreatePost(event) {
  event.preventDefault();
  const postTextInput = document.getElementById('post-text');
  const postImageInput = document.getElementById('post-image-url');
  const errorMessage = document.getElementById('post-error');
  const submitButton = document.getElementById('post-submit');
  hideMessage(errorMessage);
  const content = postTextInput.value.trim();
  const imageUrl = postImageInput.value.trim() || null;
  if (!content) {
    showMessage(errorMessage, 'Write a thought before leaving your note.');
    postTextInput.focus();
    return;
  }

  submitButton.disabled = true;
  try {
    const { error } = await getSupabaseClient().from('posts').insert({
      user_id: getStoredUser().user_id,
      content,
      image_url: imageUrl
    });
    if (error) throw error;
    postTextInput.value = '';
    postImageInput.value = '';
    document.getElementById('post-character-count').textContent = '0 / 5000';
    activeFeedFilter = 'all';
    updateNavigationState();
    await loadFeed();
    showToast('Your note is now in the baksho.');
  } catch (error) {
    showMessage(errorMessage, error.message || 'Your note could not be posted.');
  } finally {
    submitButton.disabled = false;
  }
}

async function handleAddComment(event, postId, commentInput, commentsList, countElement) {
  event.preventDefault();
  const content = commentInput.value.trim();
  if (!content) return;
  const submitButton = event.currentTarget.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  try {
    const { error } = await getSupabaseClient().from('comments').insert({
      post_id: postId,
      user_id: getStoredUser().user_id,
      content
    });
    if (error) throw error;
    commentInput.value = '';
    await loadComments(postId, commentsList, countElement);
    showToast('Your thought has been added.');
  } catch (error) {
    showToast(error.message || 'Could not add your comment.');
  } finally {
    submitButton.disabled = false;
  }
}

async function handleDeletePost(postId) {
  if (!window.confirm('Delete this note and its replies? This cannot be undone.')) return;
  try {
    const { error } = await getSupabaseClient().from('posts').delete()
      .eq('id', postId).eq('user_id', getStoredUser().user_id);
    if (error) throw error;
    await loadFeed();
    showToast('Your note has been removed.');
  } catch (error) {
    showToast(error.message || 'Could not delete this note.');
  }
}

async function handleDeleteComment(commentId, postId) {
  if (!window.confirm('Remove your comment?')) return;
  try {
    const { error } = await getSupabaseClient().from('comments').delete()
      .eq('id', commentId).eq('user_id', getStoredUser().user_id);
    if (error) throw error;
    const commentsList = document.querySelector(`.comments-list[data-post-id="${postId}"]`);
    const postCard = commentsList.closest('.post-card');
    await loadComments(postId, commentsList, postCard.querySelector('.comment-count'));
    showToast('Your comment has been removed.');
  } catch (error) {
    showToast(error.message || 'Could not remove this comment.');
  }
}

function openEditDialog(post) {
  editingPostId = post.post_id;
  document.getElementById('edit-post-text').value = post.posted_text;
  document.getElementById('edit-post-image').value = post.posted_image_url || '';
  hideMessage(document.getElementById('edit-error'));
  document.getElementById('edit-dialog').showModal();
}

function closeEditDialog() {
  editingPostId = null;
  document.getElementById('edit-dialog').close();
}

async function handleUpdatePost(event) {
  event.preventDefault();
  if (!editingPostId) return;
  const errorMessage = document.getElementById('edit-error');
  const saveButton = document.getElementById('edit-save');
  hideMessage(errorMessage);
  const content = document.getElementById('edit-post-text').value.trim();
  if (!content) return showMessage(errorMessage, 'A note cannot be empty.');
  const imageUrl = document.getElementById('edit-post-image').value.trim() || null;

  saveButton.disabled = true;
  try {
    const { error } = await getSupabaseClient().from('posts')
      .update({ content, image_url: imageUrl })
      .eq('id', editingPostId).eq('user_id', getStoredUser().user_id);
    if (error) throw error;
    closeEditDialog();
    await loadFeed();
    showToast('Your note has been updated.');
  } catch (error) {
    showMessage(errorMessage, error.message || 'Could not update your note.');
  } finally {
    saveButton.disabled = false;
  }
}

function updateProfileStats() {
  const currentUser = getStoredUser();
  const ownPostCount = allPosts.filter((post) => post.posted_user_id === currentUser.user_id).length;
  document.getElementById('my-post-count').textContent = String(ownPostCount).padStart(2, '0');
  const memberSince = currentUser.created_at ? new Date(currentUser.created_at) : null;
  document.getElementById('member-since').textContent = memberSince && !Number.isNaN(memberSince.getTime())
    ? new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(memberSince).toUpperCase()
    : 'HERE NOW';
}

function setFeedFilter(filter) {
  activeFeedFilter = filter === 'mine' ? 'mine' : 'all';
  updateNavigationState();
  renderFeed();
}

function updateNavigationState() {
  document.getElementById('nav-home').classList.toggle('active', activeFeedFilter === 'all');
  document.getElementById('nav-mine').classList.toggle('active', activeFeedFilter === 'mine');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove('show'), 2800);
}
