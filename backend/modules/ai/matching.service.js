const axios = require('axios');
const developerRepository = require('../developers/developer.repository');
const jobRepository = require('../jobs/job.repository');
const logger = require('../../utils/logger');

class MatchingService {
  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY;
    this.apiUrl = 'https://api.mistral.ai/v1/chat/completions';
  }

  async matchDevToJobs(developerId) {
    const dev = await developerRepository.findByUserId(developerId);
    const jobs = await jobRepository.findAll({ status: 'open' }, { limit: 10 });

    const prompt = `
      Act as a high-end technical recruiter. 
      Developer: Title: ${dev.title}, Skills: ${dev.skills.join(', ')}, Exp: ${dev.experienceYears} years.
      Jobs: ${JSON.stringify(jobs.map(j => ({ id: j._id, title: j.title, tech: j.techStack })))}
      
      Task: Return a JSON array of objects with "jobId" and a "matchScore" (0-100) and a brief "reason".
      Only return valid JSON.
    `;

    try {
      const response = await axios.post(this.apiUrl, {
        model: "mistral-tiny",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      }, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });

      const results = JSON.parse(response.data.choices[0].message.content);
      
      // Store results in Redis for quick retrieval by the UI
      const cacheKey = `matches:dev:${developerId}`;
      await require('../../config/redis').redis.setex(cacheKey, 3600, JSON.stringify(results));
      
      return results;
    } catch (error) {
      logger.error('Mistral Matching Error:', error.message);
      throw error;
    }
  }
}

module.exports = new MatchingService();