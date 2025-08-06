import React, { useState } from 'react';

const TimeBlocksTab = ({ 
  timeBlocks, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete,
  setSuccessMessage 
}) => {
  const [timeBlockYear, setTimeBlockYear] = useState("");
  const [timeBlockNumber, setTimeBlockNumber] = useState("");
  const [timeBlockStartTime, setTimeBlockStartTime] = useState("");
  const [timeBlockEndTime, setTimeBlockEndTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await onAdd("time-blocks", {
        batch_year: timeBlockYear,
        block_number: parseInt(timeBlockNumber),
        start_time: timeBlockStartTime,
        end_time: timeBlockEndTime,
      });
      if (result) {
        setTimeBlockYear("");
        setTimeBlockNumber("");
        setTimeBlockStartTime("");
        setTimeBlockEndTime("");
        setSuccessMessage("Time block added successfully");
      }
    } catch (error) {
      console.error("Error adding time block:", error);
    }
  };

  // Filter time blocks (if needed)
  const filteredTimeBlocks = timeBlocks || [];

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-gray-700 font-medium mb-2">
              Batch Year
            </label>
            <select
              value={timeBlockYear}
              onChange={(e) => setTimeBlockYear(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-gray-700 font-medium mb-2">
              Period Number
            </label>
            <input
              type="number"
              value={timeBlockNumber}
              onChange={(e) => setTimeBlockNumber(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              min="1"
              disabled={loading}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-gray-700 font-medium mb-2">
              Start Time (HH:MM)
            </label>
            <input
              type="text"
              value={timeBlockStartTime}
              onChange={(e) => setTimeBlockStartTime(e.target.value)}
              placeholder="e.g. 8:30"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
              title="Time format: HH:MM (24-hour)"
              disabled={loading}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-gray-700 font-medium mb-2">
              End Time (HH:MM)
            </label>
            <input
              type="text"
              value={timeBlockEndTime}
              onChange={(e) => setTimeBlockEndTime(e.target.value)}
              placeholder="e.g. 9:15"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
              title="Time format: HH:MM (24-hour)"
              disabled={loading}
            />
          </div>
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              Add Time Block
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left text-gray-700">Year</th>
              <th className="p-3 text-left text-gray-700">Period</th>
              <th className="p-3 text-left text-gray-700">Start Time</th>
              <th className="p-3 text-left text-gray-700">End Time</th>
              <th className="p-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTimeBlocks.map((block) => (
              <tr key={block.time_block_id} className="border-b">
                <td className="p-3">{block.batch_year}</td>
                <td className="p-3">{block.block_number}</td>
                <td className="p-3">{block.start_time}</td>
                <td className="p-3">{block.end_time}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => onEdit("time-blocks", block)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600 disabled:bg-gray-400"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onDelete("time-blocks", block.time_block_id, e)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TimeBlocksTab;
