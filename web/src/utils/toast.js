import toast from 'react-hot-toast';

/**
 * Toast Notification Utilities
 * Provides consistent notifications throughout the app
 */

const defaultOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    borderRadius: '8px',
    fontSize: '14px',
  },
};

export const showToast = {
  /**
   * Success toast
   */
  success: (message, options = {}) => {
    return toast.success(message, {
      ...defaultOptions,
      icon: '✅',
      ...options,
    });
  },

  /**
   * Error toast
   */
  error: (message, options = {}) => {
    return toast.error(message, {
      ...defaultOptions,
      icon: '❌',
      duration: 5000, // Show errors longer
      ...options,
    });
  },

  /**
   * Info toast
   */
  info: (message, options = {}) => {
    return toast(message, {
      ...defaultOptions,
      icon: 'ℹ️',
      ...options,
    });
  },

  /**
   * Warning toast
   */
  warning: (message, options = {}) => {
    return toast(message, {
      ...defaultOptions,
      icon: '⚠️',
      style: {
        ...defaultOptions.style,
        background: '#FFA500',
        color: '#fff',
      },
      ...options,
    });
  },

  /**
   * Loading toast (returns id for dismissing later)
   */
  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Promise toast (automatically shows loading, success, or error)
   */
  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong',
      },
      {
        ...defaultOptions,
        ...options,
      }
    );
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },
};

/**
 * API Error Toast Helper
 * Extracts error message from API response and shows toast
 */
export const showApiError = (error) => {
  let message = 'An error occurred. Please try again.';

  if (error.response?.data?.error?.message) {
    message = error.response.data.error.message;
  } else if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }

  showToast.error(message);
};

/**
 * Network Error Toast
 */
export const showNetworkError = () => {
  showToast.error('Network error. Please check your internet connection.', {
    duration: 6000,
  });
};

/**
 * Authentication Error Toast
 */
export const showAuthError = () => {
  showToast.error('Session expired. Please login again.', {
    duration: 5000,
  });
};

export default showToast;
