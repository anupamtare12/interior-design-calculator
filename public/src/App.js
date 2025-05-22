import React, { useState, useEffect } from 'react';
import { Plus, Minus, Calculator, FileText, Edit3 } from 'lucide-react';

const InteriorDesignCalculator = () => {
  const [furnitureItems, setFurnitureItems] = useState([
    {
      id: 1,
      name: 'Wardrobe',
      length: 8,
      width: 8,
      height: 2,
      type: 'wardrobe'
    }
  ]);

  const [materialRates, setMaterialRates] = useState({
    pvcLaminate: { rate: 150, brand: 'Greenlam' },
    ply18mm: { rate: 120, brand: 'Century' },
    ply12mm: { rate: 100, brand: 'Century' },
    blockBoard: { rate: 110, brand: 'Kitply' },
    laminate: { rate: 80, brand: 'Formica' },
    innerLaminate: { rate: 60, brand: 'Merino' },
    flexiblePly: { rate: 90, brand: 'Century' },
    pvcMica: { rate: 140, brand: 'Greenlam' },
    aluminumSection: { rate: 200, brand: 'Hindalco' },
  });

  const [laborPercentage, setLaborPercentage] = useState(30);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [showStandardRequirements, setShowStandardRequirements] = useState(true);

  // Standard material requirements based on your provided data
  const getStandardRequirements = (type) => {
    const standards = {
      wardrobe: {
        standardSize: { length: 8, width: 8, height: 2 },
        materials: {
          pvcLaminate: 2,
          ply18mm: 7,
          ply12mm: 3,
          blockBoard: 2,
          laminate: 3,
          innerLaminate: 12
        }
      },
      bed: {
        standardSize: { length: 6.5, width: 6, height: 1.5 },
        materials: {
          pvcLaminate: 4,
          ply18mm: 6,
          ply12mm: 2,
          laminate: 1,
          innerLaminate: 10,
          flexiblePly: 1
        }
      },
      sideTable: {
        standardSize: { length: 1.5, width: 1.5, height: 1.5 },
        materials: {
          pvcLaminate: 1,
          ply18mm: 2,
          ply12mm: 1,
          laminate: 1,
          innerLaminate: 2
        }
      },
      kitchen: {
        standardSize: { length: 12, width: 7, height: 2 },
        materials: {
          pvcMica: 4,
          ply18mm: 6,
          ply12mm: 3,
          laminate: 5,
          innerLaminate: 8,
          aluminumSection: 10
        }
      },
      tvUnit: {
        standardSize: { length: 8, width: 6, height: 0.75 },
        materials: {
          pvcLaminate: 2,
          ply18mm: 4,
          ply12mm: 1,
          laminate: 3,
          innerLaminate: 1
        }
      }
    };
    return standards[type] || standards.wardrobe;
  };

  // Calculate materials based on proportional scaling
  const calculateMaterials = (item) => {
    const standard = getStandardRequirements(item.type);
    const standardVolume = standard.standardSize.length * standard.standardSize.width * standard.standardSize.height;
    const itemVolume = item.length * item.width * item.height;
    const scaleFactor = itemVolume / standardVolume;

    let materials = {};
    Object.keys(standard.materials).forEach(material => {
      materials[material] = Math.ceil(standard.materials[material] * scaleFactor);
    });

    return materials;
  };

  // Calculate cost with special handling for plywood and blockboard (per sqft)
  const calculateMaterialCost = (materials, rates) => {
    return Object.keys(materials).reduce((total, material) => {
      let cost = 0;
      const quantity = materials[material];
      const rate = rates[material]?.rate || 0;
      
      if (material === 'ply18mm' || material === 'ply12mm' || material === 'blockBoard') {
        // For plywood and blockboard: quantity (sheets) × 32 sqft × rate per sqft
        cost = quantity * 32 * rate;
      } else {
        // For other materials: quantity × rate
        cost = quantity * rate;
      }
      
      return total + cost;
    }, 0);
  };

  const addFurniture = () => {
    const newId = Math.max(...furnitureItems.map(item => item.id)) + 1;
    setFurnitureItems([...furnitureItems, {
      id: newId,
      name: 'New Furniture',
      length: 4,
      width: 4,
      height: 2,
      type: 'wardrobe'
    }]);
  };

  const removeFurniture = (id) => {
    setFurnitureItems(furnitureItems.filter(item => item.id !== id));
  };

  const updateFurniture = (id, field, value) => {
    setFurnitureItems(furnitureItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const updateMaterialRate = (material, field, value) => {
    setMaterialRates({
      ...materialRates,
      [material]: { ...materialRates[material], [field]: value }
    });
  };

  // Calculate totals with editable quantities
  const [editableQuantities, setEditableQuantities] = useState({});

  const updateEditableQuantity = (material, quantity) => {
    setEditableQuantities({
      ...editableQuantities,
      [material]: quantity
    });
  };

  const getEffectiveQuantity = (material, calculatedQuantity) => {
    return editableQuantities[material] !== undefined ? editableQuantities[material] : calculatedQuantity;
  };

  const totalMaterials = furnitureItems.reduce((total, item) => {
    const itemMaterials = calculateMaterials(item);
    Object.keys(itemMaterials).forEach(material => {
      total[material] = (total[material] || 0) + itemMaterials[material];
    });
    return total;
  }, {});

  // Use editable quantities for cost calculation
  const effectiveTotalMaterials = {};
  Object.keys(totalMaterials).forEach(material => {
    effectiveTotalMaterials[material] = getEffectiveQuantity(material, totalMaterials[material]);
  });

  const materialCost = calculateMaterialCost(effectiveTotalMaterials, materialRates);
  const laborCost = (materialCost * laborPercentage) / 100;
  const subtotal = materialCost + laborCost;
  const gstAmount = (subtotal * gstPercentage) / 100;
  const totalCost = subtotal + gstAmount;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Calculator className="text-blue-600" />
          Interior Design Material Calculator
        </h1>
        <p className="text-gray-600">Professional material estimation for interior furniture projects</p>
      </div>

      {/* 1. FURNITURE ITEMS */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">1. Furniture Items</h2>
          <button
            onClick={addFurniture}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Furniture
          </button>
        </div>

        <div className="space-y-4">
          {furnitureItems.map((item) => {
            const standard = getStandardRequirements(item.type);
            return (
              <div key={item.id} className="border border-gray-300 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateFurniture(item.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={item.type}
                      onChange={(e) => updateFurniture(item.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="wardrobe">Wardrobe</option>
                      <option value="bed">Bed</option>
                      <option value="sideTable">Side Table</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="tvUnit">TV Unit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Length (ft)</label>
                    <input
                      type="number"
                      value={item.length}
                      onChange={(e) => updateFurniture(item.id, 'length', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width (ft)</label>
                    <input
                      type="number"
                      value={item.width}
                      onChange={(e) => updateFurniture(item.id, 'width', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (ft)</label>
                    <input
                      type="number"
                      value={item.height}
                      onChange={(e) => updateFurniture(item.id, 'height', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      step="0.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Standard Size</label>
                    <p className="text-xs text-gray-500">
                      {standard.standardSize.length}' × {standard.standardSize.width}' × {standard.standardSize.height}'
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => removeFurniture(item.id)}
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                      disabled={furnitureItems.length === 1}
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. MATERIAL REQUIREMENTS BY FURNITURE */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">2. Material Requirements by Furniture</h2>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showStandard"
              checked={showStandardRequirements}
              onChange={(e) => setShowStandardRequirements(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="showStandard" className="text-sm font-medium text-gray-700">
              Show Standard Requirements
            </label>
          </div>
        </div>
        <div className="space-y-6">
          {furnitureItems.map((item) => {
            const itemMaterials = calculateMaterials(item);
            const standard = getStandardRequirements(item.type);
            
            return (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  {item.name} ({item.length}' × {item.width}' × {item.height}')
                </h4>
                <div className={`grid grid-cols-1 ${showStandardRequirements ? 'lg:grid-cols-2' : ''} gap-4`}>
                  {/* Standard Requirements */}
                  {showStandardRequirements && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-600 mb-2">
                        Standard Requirements ({standard.standardSize.length}' × {standard.standardSize.width}' × {standard.standardSize.height}')
                      </h5>
                      <div className="bg-gray-50 rounded p-3">
                        {Object.entries(standard.materials).map(([material, qty]) => (
                          <div key={material} className="flex justify-between text-sm">
                            <span className="capitalize">{material.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span>{qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Calculated Requirements */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-600 mb-2">
                      Required for Your Size
                    </h5>
                    <div className="bg-blue-50 rounded p-3">
                      {Object.entries(itemMaterials).map(([material, qty]) => (
                        <div key={material} className="flex justify-between text-sm">
                          <span className="capitalize">{material.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="font-medium">{qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TOTAL MATERIAL SUMMARY */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Total Material Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left">Material</th>
                <th className="border border-gray-300 px-4 py-3 text-center">Brand</th>
                <th className="border border-gray-300 px-4 py-3 text-center">Sheets/Units</th>
                <th className="border border-gray-300 px-4 py-3 text-center">Total Area/Qty</th>
                <th className="border border-gray-300 px-4 py-3 text-center">Rate</th>
                <th className="border border-gray-300 px-4 py-3 text-center">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(totalMaterials).map(([material, calculatedQuantity]) => {
                if (calculatedQuantity <= 0) return null;
                
                const effectiveQuantity = getEffectiveQuantity(material, calculatedQuantity);
                const isPlywoodType = material === 'ply18mm' || material === 'ply12mm' || material === 'blockBoard';
                const totalArea = isPlywoodType ? effectiveQuantity * 32 : effectiveQuantity;
                const rate = materialRates[material]?.rate || 0;
                const brand = materialRates[material]?.brand || '';
                const amount = isPlywoodType ? effectiveQuantity * 32 * rate : effectiveQuantity * rate;
                
                return (
                  <tr key={material}>
                    <td className="border border-gray-300 px-4 py-3 capitalize font-medium">
                      {material.replace(/([A-Z])/g, ' $1').trim()}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => updateMaterialRate(material, 'brand', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded text-center"
                        placeholder="Brand"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <input
                        type="number"
                        value={effectiveQuantity}
                        onChange={(e) => updateEditableQuantity(material, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-sm border border-gray-200 rounded text-center font-medium"
                        min="0"
                      />
                      {effectiveQuantity !== calculatedQuantity && (
                        <div className="text-xs text-blue-600 mt-1">
                          (Calc: {calculatedQuantity})
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      {isPlywoodType ? `${totalArea} sqft` : `${effectiveQuantity} units`}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <input
                        type="number"
                        value={rate}
                        onChange={(e) => updateMaterialRate(material, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-sm border border-gray-200 rounded text-center"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {isPlywoodType ? '/sqft' : '/unit'}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center font-bold">
                      ₹{amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. TOTAL COST SUMMARY */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="text-green-600" />
          4. Total Cost Summary
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Cost Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Labor Percentage (%)</label>
                <input
                  type="number"
                  value={laborPercentage}
                  onChange={(e) => setLaborPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Percentage (%)</label>
                <input
                  type="number"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="50"
                />
              </div>
            </div>
          </div>

          {/* Final Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Final Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Material Cost:</span>
                <span className="font-medium">₹{materialCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Labor Cost ({laborPercentage}%):</span>
                <span className="font-medium">₹{laborCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-lg border-t border-gray-300 pt-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">GST ({gstPercentage}%):</span>
                <span className="font-medium">₹{gstAmount.toLocaleString()}</span>
              </div>
              <div className="border-t-2 border-gray-400 pt-3">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total Cost:</span>
                  <span className="text-green-600">₹{totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteriorDesignCalculator;
