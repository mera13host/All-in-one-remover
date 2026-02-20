export default function ApiDocsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Developer API</h2>
        <p className="mb-6">Integrate our background removal tool into your own applications with a simple API call.</p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Endpoint</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm break-all">POST /api/v1/remove-background</pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Authentication</h3>
            <p>You need to include your API key in the Authorization header as a Bearer token.</p>
            <pre className="bg-gray-100 p-2 rounded text-sm">Authorization: Bearer YOUR_API_KEY</pre>
            <p className="text-sm text-gray-600 mt-1">You can find your API key on your <a href="/dashboard" className="text-blue-500 hover:underline">Dashboard</a>.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Request Body</h3>
            <p>The request must be a `multipart/form-data` request with a single field named `image` containing the image file.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Example (cURL)</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm break-all">
              {`curl -X POST \
  https://your-app-url.com/api/v1/remove-background \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -F 'image=@/path/to/your/image.jpg'`}
            </pre>
          </div>

           <div>
            <h3 className="text-lg font-semibold">Response</h3>
            <p>On success, the API returns the processed image as a PNG file (`image/png`). On error, it returns a JSON object with an error message.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
