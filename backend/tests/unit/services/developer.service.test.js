const developerService = require('../../../modules/developers/developer.service');
const developerRepository = require('../../../modules/developers/developer.repository');
const { addMatchJob } = require('../../../queues/ai.queue');
const logger = require('../../../utils/logger');

jest.mock('../../../modules/developers/developer.repository');
jest.mock('../../../queues/ai.queue');
jest.mock('../../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('DeveloperService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return profile if exists', async () => {
      const mockProfile = { _id: 'dev1', userId: 'user1' };
      developerRepository.findByUserId.mockResolvedValue(mockProfile);

      const result = await developerService.getProfile('user1');

      expect(developerRepository.findByUserId).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockProfile);
    });

    it('should throw error if profile not found', async () => {
      developerRepository.findByUserId.mockResolvedValue(null);
      await expect(developerService.getProfile('missing')).rejects.toThrow('Developer profile not found');
      expect(logger.debug).toHaveBeenCalledWith('Developer profile not found for userId: missing');
    });
  });

  describe('updateProfile', () => {
    it('should update profile and trigger AI matching', async () => {
      const userId = 'user1';
      const updateData = { skills: ['Node', 'React'], title: 'Senior Dev' };
      const updatedProfile = { _id: 'dev1', ...updateData };

      developerRepository.updateByUserId.mockResolvedValue(updatedProfile);

      const result = await developerService.updateProfile(userId, updateData);

      expect(developerRepository.updateByUserId).toHaveBeenCalledWith(userId, expect.objectContaining({
        skills: ['node', 'react'],
        title: 'Senior Dev'
      }));
      expect(addMatchJob).toHaveBeenCalledWith(userId, 'developer');
      expect(logger.info).toHaveBeenCalledWith(`Developer profile updated: dev1 by user ${userId}`);
      expect(result).toEqual(updatedProfile);
    });

    it('should throw error if profile not found during update', async () => {
      developerRepository.updateByUserId.mockResolvedValue(null);
      await expect(developerService.updateProfile('user1', {})).rejects.toThrow('Failed to update profile: Profile does not exist');
    });
  });

  describe('uploadResume', () => {
    it('should update resume and trigger matching', async () => {
      const userId = 'user1';
      const resumeUrl = 'https://example.com/resume.pdf';
      const profile = { _id: 'dev1', resumeUrl };

      developerRepository.updateByUserId.mockResolvedValue(profile);

      const result = await developerService.uploadResume(userId, resumeUrl);

      expect(developerRepository.updateByUserId).toHaveBeenCalledWith(userId, { resumeUrl });
      expect(addMatchJob).toHaveBeenCalledWith(userId, 'developer');
      expect(logger.info).toHaveBeenCalledWith(`Resume uploaded for developer: dev1`);
      expect(result).toEqual(profile);
    });
  });
});