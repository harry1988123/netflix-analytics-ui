import React from 'react'
import { Button } from './ui/button.jsx'
import { Card } from './ui/card.jsx'

export default function ProfileSelector({ selectedProfiles, onProfilesChange }) {
  const profiles = [1, 2, 3, 4, 5]
  
  const toggleProfile = (profile) => {
    if (selectedProfiles.includes(profile)) {
      // Don't allow deselecting if it's the last selected profile
      if (selectedProfiles.length > 1) {
        onProfilesChange(selectedProfiles.filter(p => p !== profile))
      }
    } else {
      onProfilesChange([...selectedProfiles, profile].sort())
    }
  }

  const selectAll = () => {
    onProfilesChange([1, 2, 3, 4, 5])
  }

  const isAllSelected = selectedProfiles.length === 5

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-foreground">Filter by Profile</label>
        {!isAllSelected && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={selectAll}
            className="text-xs h-auto py-1"
          >
            Select All
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {profiles.map(profile => {
          const isSelected = selectedProfiles.includes(profile)
          return (
            <Button
              key={profile}
              type="button"
              onClick={() => toggleProfile(profile)}
              disabled={isSelected && selectedProfiles.length === 1}
              variant={isSelected ? "default" : "outline"}
              size="default"
              className="rounded-full"
            >
              Profile {profile}
            </Button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {selectedProfiles.length === 5 
          ? 'Showing all profiles' 
          : `Showing ${selectedProfiles.length} profile${selectedProfiles.length > 1 ? 's' : ''}: ${selectedProfiles.map(p => `Profile ${p}`).join(', ')}`
        }
      </p>
    </Card>
  )
}

