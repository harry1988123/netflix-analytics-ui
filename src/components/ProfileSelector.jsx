import React from 'react'

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
    <div className="card p-3">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-foreground">Filter by Profile</label>
        {!isAllSelected && (
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Select All
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {profiles.map(profile => {
          const isSelected = selectedProfiles.includes(profile)
          return (
            <button
              key={profile}
              type="button"
              onClick={() => toggleProfile(profile)}
              disabled={isSelected && selectedProfiles.length === 1}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                }
                ${isSelected && selectedProfiles.length === 1
                  ? 'opacity-75 cursor-not-allowed'
                  : 'cursor-pointer'
                }
              `}
            >
              Profile {profile}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {selectedProfiles.length === 5 
          ? 'Showing all profiles' 
          : `Showing ${selectedProfiles.length} profile${selectedProfiles.length > 1 ? 's' : ''}: ${selectedProfiles.map(p => `Profile ${p}`).join(', ')}`
        }
      </p>
    </div>
  )
}

