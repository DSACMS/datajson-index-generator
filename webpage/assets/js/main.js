document.addEventListener('DOMContentLoaded', initializePage);

function initializePage() {
    initializeBanner()
    initializeMobileMenu()
    initializeTokenToggle()
    initializeChipsInput()
    generateIndexJSON()
}

function initializeBanner() {
    const bannerButton = document.querySelector('.usa-banner__button')
    const bannerContent = document.getElementById('gov-banner')
    const cmsHeader = document.querySelector('.cms-header')
    let bannerExpanded = false

    if (!bannerButton || !bannerContent) return;

    bannerContent.style.display = 'none'

    bannerButton.addEventListener('click', function () {
        bannerExpanded = !bannerExpanded
        this.setAttribute('aria-expanded', bannerExpanded)

        toggleBannerVisibility(bannerExpanded, bannerContent, cmsHeader)
    });
}

function toggleBannerVisibility(isExpanded, bannerContent, cmsHeader) {
    if (isExpanded) {
        bannerContent.style.display = 'block'
        if (cmsHeader) {
            cmsHeader.style.top = bannerContent.offsetHeight + 24 + 'px'
        }
    } else {
        bannerContent.style.display = 'none'
        if (cmsHeader) {
            cmsHeader.style.top = '24px'
        }
    }
}

function initializeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle')
    const mainMenu = document.getElementById('main-menu')

    if (!menuToggle || !mainMenu) return

    menuToggle.addEventListener('click', function () {
        const expanded = this.getAttribute('aria-expanded') === 'true' || false;
        this.setAttribute('aria-expanded', !expanded)
        mainMenu.classList.toggle('show')
    });
}

function initializeTokenToggle() {
    const tokenField = document.getElementById('github-token')
    const tokenToggle = document.getElementById('show-token')

    if (!tokenField || !tokenToggle) return

    tokenToggle.addEventListener('click', function () {
        if (tokenField.type === 'password') {
            tokenToggle.textContent = "Hide"
            tokenField.type = "text"
        } else {
            tokenToggle.textContent = "Show"
            tokenField.type = "password"
        }
    });
}

function initializeChipsInput() {
    const removeButtonHTML = '<button aria-label="remove this chip">×</button>';

    function updateHiddenInput() {
        const chipValues = [];
        document.querySelectorAll('.chip').forEach(chip => {
            const chipText = chip.textContent.replace('×', '').trim();
            chipValues.push(chipText);
        });

        const hiddenInput = document.getElementById('github-orgs');
        hiddenInput.value = chipValues.join(',');
    }

    function createChip(text) {
        if (!text || text.trim() === '') return;

        let isDuplicate = false;
        document.querySelectorAll('.chip').forEach(chip => {
            const chipText = chip.textContent.replace('×', '').trim();
            if (chipText.toLowerCase() === text.toLowerCase()) {
                isDuplicate = true;
            }
        });

        if (!isDuplicate) {
            const chipHTML = document.createElement('span');
            chipHTML.className = 'chip';
            chipHTML.innerHTML = escapeHTML(text) + removeButtonHTML;

            const input = document.getElementById('github-orgs-input');
            input.parentNode.insertBefore(chipHTML, input);

            updateHiddenInput();
        }
    }

    function escapeHTML(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initializeFromValue() {
        const hiddenInput = document.getElementById('github-orgs');
        const value = hiddenInput.value;

        if (value) {
            const values = value.split(',');
            values.forEach(val => {
                createChip(val.trim());
            });
        }
    }

    const chipsContainer = document.querySelector('.chips-input > .inner');
    if (chipsContainer) {
        chipsContainer.addEventListener('click', function (e) {
            if (e.target === this) {
                this.querySelector('input[type="text"]').focus();
            }
        });

        const input = document.getElementById('github-orgs-input');
        if (input) {
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    let value = this.value;

                    if (e.key === ',') {
                        value = value.substring(0, value.length - 1);
                    }

                    createChip(value.trim());
                    this.value = '';
                }
                else if (e.key === 'Backspace' && this.value === '') {
                    const chips = document.querySelectorAll('.chip');
                    if (chips.length > 0) {
                        chips[chips.length - 1].remove();
                        updateHiddenInput();
                    }
                }
            });
        }

        document.addEventListener('click', function (e) {
            if (e.target.closest('.chip > button')) {
                const chip = e.target.closest('.chip');
                if (chip) {
                    chip.remove();
                    updateHiddenInput();
                }
            }
        });

        initializeFromValue();
    }
}

function updateProgressBar(current, total) {
    const progressCount = document.getElementById('progress-count')
    const progressIndicator = document.getElementById('progress-indicator')

    if (progressCount && progressIndicator) {
        progressCount.textContent = `${current}/${total}`
        const percentage = (current / total) * 100
        progressIndicator.style.width = `${percentage}%`
    }
}

function showResults(successCount, totalCount, successRepos, failedRepos) {
    const resultsSection = document.getElementById('results-section')
    const successCountElement = document.getElementById('success-count')
    const totalCountElement = document.getElementById('total-count')
    const failedCountElement = document.getElementById('failed-count')
    const failedReposContainer = document.querySelector('.failed-repos')
    const successReposContainer = document.querySelector('.success-repos')


    if (resultsSection && successCountElement && totalCountElement && failedCountElement && failedReposContainer && successReposContainer) {
        console.log("great!")
        successCountElement.textContent = successCount
        totalCountElement.textContent = totalCount
        failedCountElement.textContent = failedRepos.length

        if (successRepos.length !== 0) {
            console.log("successRepos.length !== 0 is true")
            successRepos.forEach(repo => {
                console.log("looping through repos")

                const repoItem = document.createElement('div')
                repoItem.className = 'success-repo-item'

                let name = repo._repoName
                let owner = repo._repoOwner

                repoItem.innerHTML = `
                    <span class="success-icon">✓</span>
                    <span class="repo-name">${owner} / </span>
                    <span class="repo-name">${name}</span>
                    <p class="repo-status">Successfully added</p>
                `
                successReposContainer.appendChild(repoItem)
            })
        }

        if (failedRepos.length !== 0) {
            failedRepos.forEach(repo => {
                const repoItem = document.createElement('div')
                repoItem.className = 'failed-repo-item'
                repoItem.innerHTML = `
                    <span class="error-icon">✕</span>
                    <span class="repo-name">${repo.owner} / </span>
                    <span class="repo-name">${repo.name}</span>
                    <p class="error-message">${repo.errorMessage}</p>
                `
                failedReposContainer.appendChild(repoItem)
            })
        }

        resultsSection.style.display = 'block';

        const errorContainer = document.getElementById('general-error-container')
        if (errorContainer) {
            errorContainer.style.display = 'none'
        }

        const resultsContent = resultsSection.querySelector('.results-content')
        if (resultsContent) {
            resultsContent.style.display = 'block'
        }
    }
}

function showGeneralError(errorMessage) {
    const resultsSection = document.getElementById('results-section')
    let errorContainer = document.getElementById('general-error-container')

    if (!errorContainer) {
        errorContainer = document.createElement('div')
        errorContainer.id = 'general-error-container'
        errorContainer.className = 'general-error'

        if (resultsSection) {
            const heading = resultsSection.querySelector('.section-heading')
            if (heading) {
                heading.insertAdjacentElement('afterend', errorContainer)
            } else {
                resultsSection.prepend(errorContainer)
            }
        }
    }

    errorContainer.textContent = errorMessage;

    if (resultsSection) {
        resultsSection.style.display = 'block'
        const resultsContent = resultsSection.querySelector('.results-content')

        if (resultsContent) {
            resultsContent.style.display = 'none'
        }
    }

    errorContainer.style.display = 'block';
}

async function generateIndexJSON() {
    const generateButton = document.getElementById('generate-btn')
    const orgInput = document.getElementById('github-orgs')
    const tokenInput = document.getElementById('github-token')
    const resultsSection = document.getElementById('results-section')
    const errorContainer = document.getElementById('general-error-container')
    const resultsContent = resultsSection.querySelector('.results-content')

    let index = {
        "files": []
    }

    let repos = []
    let files = []

    let failedRepos = []
    let totalRepos = 0
    let processedRepos = 0

    generateButton.addEventListener('click', async function () {
        generateButton.classList.add('loading')
        
        failedRepos = []
        totalRepos = 0
        processedRepos = 0

        if (resultsSection) {
            resultsSection.style.display = 'none'

            if (errorContainer) {
                errorContainer.style.display = 'none'
            }

            if (resultsContent) {
                resultsContent.style.display = 'block'
            }
        }

        if (!orgInput.value) {
            showGeneralError("Please fill in the list of organizations you would like to scan.")
            generateButton.classList.remove('loading')
            return
        }

        try {
            try {
                repos = await fetchAllRepos(orgInput.value, tokenInput.value)
                totalRepos = repos.length

                if (totalRepos === 0) {
                    showGeneralError("No repositories found. Please check your GitHub Organizations and token.")
                    generateButton.classList.remove('loading')
                    return
                }

                updateProgressBar(0, totalRepos)
            } catch (repoError) {
                showGeneralError(repoError.message)
                generateButton.classList.remove('loading')
                return
            }

            try {
                files = await fetchAllFiles(repos, tokenInput.value,
                    (current) => {
                        processedRepos = current
                        updateProgressBar(current, totalRepos)
                    },
                    (repo, errorMessage) => {
                        failedRepos.push({
                            owner: repo.owner.login,
                            name: repo.name,
                            errorMessage: errorMessage
                        })
                    }
                )
            } catch (filesError) {
                showGeneralError("Error fetching repository files: " + filesError.message)
                generateButton.classList.remove('loading')
                return
            }

            if (repos && files) {
                index['files'] = files

                try {
                    downloadIndex(index)
                } catch (downloadError) {
                    showGeneralError("Error downloading index file: " + downloadError.message)
                    generateButton.classList.remove('loading')
                    return
                }
            }

            const successCount = totalRepos - failedRepos.length
            showResults(successCount, totalRepos, files, failedRepos)

            generateButton.classList.remove('loading')
        } catch (error) {
            console.error("Error generating index:", error)
            showGeneralError("An unexpected error occurred: " + error.message)

            generateButton.classList.remove('loading')
        }
    })
}

async function fetchAllRepos(orgs, token) {
    let allRepositories = []
    const orgsArray = orgs.split(',')
    const failedOrgs = []

    const orgPromises = orgsArray.map(async (org) => {
        let trimmedOrg = org.trim()
        let page = 1
        let hasMore = true
        let orgRepos = []

        while (hasMore) {
            const url = new URL(`https://api.github.com/orgs/${trimmedOrg}/repos`)
            url.searchParams.append('per_page', 100) // max github allows
            url.searchParams.append('page', page)

            const headers = {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }

            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers
                })

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null)
                    let errorMessage = `GitHub API Error (${response.status})`

                    if (errorData && errorData.message) {
                        errorMessage += `: ${errorData.message}`
                    }

                    if (response.status === 404) {
                        failedOrgs.push({
                            name: trimmedOrg,
                            error: "Organization not found"
                        })
                    } else {
                        failedOrgs.push({
                            name: trimmedOrg,
                            error: errorMessage
                        })
                    }

                    hasMore = false
                    return []
                }

                const repos = await response.json()
                orgRepos = [...orgRepos, ...repos]

                const linkHeader = response.headers.get('Link')
                hasMore = linkHeader && linkHeader.includes('rel="next"')
                page++
            } catch (error) {
                console.error(`Error fetching repositories for ${trimmedOrg}:`, error)
                failedOrgs.push({
                    name: trimmedOrg,
                    error: error.message
                })

                hasMore = false
                return []
            }
        }
        return orgRepos
    })

    const orgResults = await Promise.all(orgPromises)
    orgResults.forEach(repos => {
        allRepositories = [...allRepositories, ...repos]
    })

    if (failedOrgs.length > 0) {
        if (failedOrgs.length === orgsArray.length) {
            throw new Error(`Could not fetch repositories: ${failedOrgs.map(org => `${org.name} (${org.error})`).join(', ')}`)
        }
    }

    return allRepositories
}

async function fetchAllFiles(repositories, token, progressCallback, errorCallback) {
    let files = []
    let processedCount = 0

    for (const repo of repositories) {
        const url = new URL(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents/data.json`)

        const headers = {
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers
            })

            processedCount++
            if (progressCallback) progressCallback(processedCount)

            if (response.ok) {
                const fileData = await response.json()

                if (fileData.content && fileData.encoding === 'base64') {
                    const decodedData = atob(fileData.content.replace(/\n/g, ''))

                    try {
                        const finalContent = JSON.parse(decodedData);
                        // would be good to actually vaildate the recieved data.json schema to the actual one here

                        const orderedContent = {    
                            organization: repo.owner.login,
                            name: repo.name,    
                            organization: finalContent.organization,
                            ...Object.fromEntries(
                                Object.entries(finalContent).filter(([key]) => key !== 'organization')
                            ),
                            // used for display 
                            _repoOwner: repo.owner.login,    
                            _repoName: repo.name             
                        }

                        files.push(orderedContent)
                    } catch (error) {
                        console.error(`Error parsing JSON for ${repo.name}:`, error)
                        if (errorCallback) errorCallback(repo, "This data.json file is not formatted correctly")
                    }
                }
            } else {
                console.log(`File not found or access denied for ${repo.name} / Status: ${response.status}`)

                if (response.status === 404) {
                    if (errorCallback) errorCallback(repo, "No data.json found")
                } else {
                    if (errorCallback) errorCallback(repo, `Access denied (${response.status})`)
                }
            }
        } catch (error) {
            console.error('Error fetching files', error)
            processedCount++
            if (progressCallback) progressCallback(processedCount)
            if (errorCallback) errorCallback(repo, "Error fetching data.json")
        }
    }
    return files
}

function downloadIndex(index) {
    const jsonString = JSON.stringify(index, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const temp = document.createElement('a')
    temp.href = url
    temp.download = "data-index.json"

    document.body.appendChild(temp)
    temp.click()

    document.body.removeChild(temp)
    URL.revokeObjectURL(url)
}