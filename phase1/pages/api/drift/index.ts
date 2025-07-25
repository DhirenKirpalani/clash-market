import { NextApiRequest, NextApiResponse } from 'next';

// Example data - replace with your actual data model
type DriftData = {
  id: string;
  name: string;
  timestamp: number;
};

// Mock database - replace with your actual database implementation
const mockData: DriftData[] = [
  { id: '1', name: 'Position 1', timestamp: Date.now() },
  { id: '2', name: 'Position 2', timestamp: Date.now() },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGET(req, res);
    case 'POST':
      return handlePOST(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET handler implementation
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Return all drift data
    res.status(200).json({
      success: true,
      data: mockData,
      message: 'Drift data retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching drift data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drift data',
    });
  }
}

// POST handler implementation
async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get data from request body
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    // Create new drift data entry
    const newEntry: DriftData = {
      id: (mockData.length + 1).toString(),
      name,
      timestamp: Date.now(),
    };

    // In a real app, you would save to your database here
    mockData.push(newEntry);

    // Return success response
    res.status(201).json({
      success: true,
      data: newEntry,
      message: 'Drift data created successfully',
    });
  } catch (error) {
    console.error('Error creating drift data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create drift data',
    });
  }
}
