const axios = require('axios');
const developerRepository = require('../developers/developer.repository');
const jobRepository = require('../jobs/job.repository');
const redis = require('../../config/redis');
const logger = require('../../utils/logger');

class MatchingService {
  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY;
    this.apiUrl = 'https://api.mistral.ai/v1/chat/completions';
  }

  async matchDevToJobs(developerId) {
    logger.info(`Starting AI matching for developer ${developerId}`);
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

      const content = response.data.choices[0].message.content;
      const results = JSON.parse(content);

      // Store results in Redis
      const cacheKey = `matches:dev:${developerId}`;
      await redis.setex(cacheKey, 3600, JSON.stringify(results));

      logger.info(`AI matching completed for developer ${developerId}, ${results.length} matches`);
      return results;
    } catch (error) {
      logger.error('Mistral Matching Error:', error.message);
      throw error;
    }
  }
}

module.exports = new MatchingService();