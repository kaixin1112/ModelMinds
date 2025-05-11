"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Loader2, Search, Info, Check, X } from "lucide-react";
import { getSmartVendingMachines, getMaterialPricing, type SmartVendingMachine } from "@/services/smart-vending-machine";
import MaterialIcon from '@/components/MaterialIcon';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const [machines, setMachines] = useState<SmartVendingMachine[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [universalPricing, setUniversalPricing] = useState<Map<string, number> | null>(null);
  const [isLoadingMachines, setIsLoadingMachines] = useState(true);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoadingMachines(true);
      setIsLoadingPricing(true);
      try {
        // Using a default location for fetching machines, service generates globally
        const fetchedMachines = await getSmartVendingMachines({ lat: 3.1390, lng: 101.6869 });
        setMachines(fetchedMachines);
        
        const fetchedPricing = await getMaterialPricing(); // No ID needed for universal pricing
        setUniversalPricing(fetchedPricing);

      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        // Handle error (e.g., show a toast notification)
      } finally {
        setIsLoadingMachines(false);
        setIsLoadingPricing(false);
      }
    }
    fetchInitialData();
  }, []);


  const selectedMachineDetails = useMemo(() => {
    if (selectedMachineId === "all" || !selectedMachineId) return null;
    return machines.find(machine => machine.id === selectedMachineId);
  }, [machines, selectedMachineId]);

  const filteredPricingData = useMemo(() => {
    if (!universalPricing) return [];
    
    const pricingArray = Array.from(universalPricing.entries()).map(([material, price]) => {
        const isAccepted = selectedMachineDetails ? selectedMachineDetails.acceptedMaterialTypes.includes(material) : true; // Show all if no machine selected or if it is accepted
        return { material, price, isAccepted };
    });

    if (!searchTerm) return pricingArray;
    
    return pricingArray.filter(({ material }) => 
      material.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [universalPricing, searchTerm, selectedMachineDetails]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Material Pricing</h1>
        <p className="text-muted-foreground">View universal prices for recyclable materials. Select a machine to see which materials it accepts.</p>
      </div>

      <Alert className="mb-6 border-primary/50 bg-primary/5 text-primary-foreground dark:bg-primary/10 dark:text-primary-foreground">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary">Universal Pricing</AlertTitle>
        <AlertDescription className="text-primary/80">
          The prices listed below are standard across all SmartCycle vending machines.
          Selecting a specific machine will highlight which of these materials it currently accepts.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Filter by Machine</CardTitle>
            <CardDescription>Optional: See materials accepted by a specific machine.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMachines ? (
              <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Loading machines...</span>
              </div>
            ) : machines.length > 0 ? (
              <Select onValueChange={(value) => setSelectedMachineId(value === "all" ? null : value)} value={selectedMachineId || "all"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Machines (Show All Materials)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Machines (Show All Materials)</SelectItem>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      Machine ID: {machine.id} ({machine.cityName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-muted-foreground">No vending machines available to filter by.</p>
            )}
            {selectedMachineDetails && (
                <div className="mt-4 p-3 bg-secondary/50 rounded-md border border-border">
                    <h4 className="font-semibold text-sm mb-1">Machine {selectedMachineDetails.id.split('-')[1]} ({selectedMachineDetails.cityName}) Accepts:</h4>
                    <p className="text-xs text-muted-foreground mb-2">{selectedMachineDetails.address}</p>
                    {selectedMachineDetails.acceptedMaterialTypes.length > 0 ? (
                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                            {selectedMachineDetails.acceptedMaterialTypes.map(material => <li key={material}>{material}</li>)}
                        </ul>
                    ) : (
                        <p className="text-xs text-muted-foreground">No specific materials listed for this machine.</p>
                    )}
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-lg">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="flex items-center">
                            <DollarSign className="mr-2 h-6 w-6 text-primary" />
                            Current Material Prices (MYR)
                        </CardTitle>
                        <CardDescription>Prices are per kilogram.</CardDescription>
                    </div>
                    <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search materials..."
                        className="pl-8 sm:w-[200px] md:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoadingPricing ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading pricing...</span>
                </div>
                ) : universalPricing && filteredPricingData.length > 0 ? (
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[70px]">Icon</TableHead>
                        <TableHead>Material Type</TableHead>
                        <TableHead className="text-right">Price (MYR/kg)</TableHead>
                        {selectedMachineId && selectedMachineId !== "all" && <TableHead className="text-center w-[150px]">Accepted by Machine</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPricingData.map(({ material, price, isAccepted }) => (
                        <TableRow 
                          key={material} 
                          className={cn(selectedMachineId && selectedMachineId !== "all" && !isAccepted ? "opacity-40 bg-muted/30" : "hover:bg-muted/50")}
                        >
                            <TableCell className="py-3">
                                <MaterialIcon materialType={material} className="h-7 w-7 text-primary" />
                            </TableCell>
                            <TableCell className="font-medium py-3">{material}</TableCell>
                            <TableCell className="text-right py-3">{price.toFixed(2)}</TableCell>
                            {selectedMachineId && selectedMachineId !== "all" && (
                                <TableCell className="text-center py-3">
                                {isAccepted ? (
                                    <Badge variant="default" className="bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600">
                                      <Check className="h-3.5 w-3.5 mr-1 -ml-0.5"/> Yes
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-300 hover:bg-red-200 dark:bg-red-700/30 dark:text-red-300 dark:border-red-600">
                                      <X className="h-3.5 w-3.5 mr-1 -ml-0.5"/> No
                                    </Badge>
                                )}
                                </TableCell>
                            )}
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                ) : universalPricing && filteredPricingData.length === 0 && searchTerm ? (
                <p className="text-center py-10 text-muted-foreground">No materials found matching "{searchTerm}".</p>
                ) : (
                <p className="text-center py-10 text-muted-foreground">No pricing information available or no materials listed.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
