import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Tracks which request is currently being accepted/rejected

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('http://localhost:5000/api/request/received', {
          withCredentials: true
        });
        setRequests(res.data.requests || []);
      } catch (err) {
        setError('Failed to load your requests. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleRespond = async (requestId, action) => {
    try {
      setProcessingId(requestId);
      setError('');
      
      await axios.post('http://localhost:5000/api/request/respond', { requestId, action }, {
        withCredentials: true
      });
      
      // Capitalize the first letter of the action for the success message
      const formattedAction = action.charAt(0).toUpperCase() + action.slice(1);
      setSuccess(`Request ${formattedAction}ed successfully.`);
      
      // Remove the processed request from the UI
      setRequests(currentRequests => currentRequests.filter(r => r._id !== requestId));
      
      // Auto-dismiss the success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError(`Failed to ${action} request. Please try again.`);
      setSuccess('');
    } finally {
      setProcessingId(null);
    }
  };

  // Helper function to generate an avatar based on the sender's name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-2xl w-full">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Connection Requests</h2>
          <p className="mt-2 text-sm text-gray-500">Manage people who want to connect and share skills with you.</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center mb-6 shadow-sm">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-200 flex items-center mb-6 shadow-sm transition-all duration-500">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48 bg-white rounded-2xl shadow-sm border border-gray-200">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          /* Request List */
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">You're all caught up!</h3>
                <p className="mt-1 text-gray-500 text-sm">You don't have any pending connection requests right now.</p>
              </div>
            ) : (
              requests.map(request => (
                <div key={request._id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* User Info */}
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-sm">
                      {getInitials(request.sender?.name)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{request.sender?.name || 'Unknown User'}</h4>
                      <p className="text-sm text-gray-500">{request.sender?.email || 'No email provided'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <button 
                      onClick={() => handleRespond(request._id, 'accept')}
                      disabled={processingId === request._id}
                      className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === request._id ? (
                         <svg className="animate-spin h-4 w-4 mr-1 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      )}
                      Accept
                    </button>
                    
                    <button 
                      onClick={() => handleRespond(request._id, 'reject')}
                      disabled={processingId === request._id}
                      className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-white text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {processingId === request._id ? (
                         <svg className="animate-spin h-4 w-4 mr-1 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                      Decline
                    </button>
                  </div>
                  
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;