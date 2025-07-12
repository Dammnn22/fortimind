import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Settings } from 'lucide-react';

const TestConsultationSystem: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🧪 Test Consultation System</h1>
        <p className="text-gray-600">
          Test the complete consultation booking flow with PayPal integration
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Frontend Tests */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            Frontend Tests
          </h2>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/consultas')}
              className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="font-semibold text-blue-800">Consultation Listing</div>
              <div className="text-sm text-blue-600">View available consultations and user history</div>
            </button>
            
            <button
              onClick={() => navigate('/consultas/reservar?tipo=psicologo')}
              className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="font-semibold text-green-800">Book Psychology Session</div>
              <div className="text-sm text-green-600">Test booking form with PayPal integration</div>
            </button>
            
            <button
              onClick={() => navigate('/consultas/reservar?tipo=nutricionista')}
              className="w-full text-left p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="font-semibold text-orange-800">Book Nutrition Session</div>
              <div className="text-sm text-orange-600">Test booking form for nutritionist</div>
            </button>
            
            <button
              onClick={() => navigate('/consultas/reservar?tipo=coach')}
              className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="font-semibold text-purple-800">Book Fitness Coaching</div>
              <div className="text-sm text-purple-600">Test booking form for fitness coach</div>
            </button>
          </div>
        </div>

        {/* Backend Tests */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-green-500" />
            Backend Status
          </h2>
          
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-800 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Firebase Functions
              </div>
              <div className="text-sm text-green-600">
                Functions built and ready for emulator
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-800 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                PayPal Webhook
              </div>
              <div className="text-sm text-blue-600">
                Webhook handlers for payment confirmation
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="font-semibold text-yellow-800 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Admin Notifications
              </div>
              <div className="text-sm text-yellow-600">
                Real-time notifications for new consultations
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-800 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Video Call Links
              </div>
              <div className="text-sm text-purple-600">
                Automatic Google Meet link generation
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">🔍 Testing Instructions</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Complete Flow Test:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Click "Book Psychology Session"</li>
              <li>Fill out the consultation form</li>
              <li>Submit and get redirected to PayPal</li>
              <li>Complete payment in PayPal sandbox</li>
              <li>Get redirected to confirmation page</li>
              <li>Check consultation appears in history</li>
              <li>Verify admin receives notification</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Error Handling Test:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Start booking process</li>
              <li>Go to PayPal but cancel payment</li>
              <li>Verify cancellation message</li>
              <li>Try booking with invalid date</li>
              <li>Test validation errors</li>
              <li>Check consultation status updates</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Development URLs */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-bold mb-4 text-blue-800">🔧 Development URLs</h3>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-blue-800">Frontend:</div>
            <code className="text-blue-600">http://localhost:5174</code>
          </div>
          
          <div>
            <div className="font-semibold text-blue-800">Functions Emulator:</div>
            <code className="text-blue-600">http://localhost:5001</code>
          </div>
          
          <div>
            <div className="font-semibold text-blue-800">PayPal Sandbox:</div>
            <code className="text-blue-600">PayPal Developer Account</code>
          </div>
          
          <div>
            <div className="font-semibold text-blue-800">Firestore Emulator:</div>
            <code className="text-blue-600">Firebase Console</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConsultationSystem;
