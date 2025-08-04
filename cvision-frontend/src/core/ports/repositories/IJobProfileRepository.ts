import { JobProfile, CreateJobProfileDto, UpdateJobProfileDto, JobProfileResponse, JobProfileListResponse } from '../../domain/entities/JobProfile';

export interface IJobProfileRepository {
  getAll(): Promise<JobProfileListResponse>;
  getById(id: string): Promise<JobProfileResponse>;
  create(data: CreateJobProfileDto): Promise<JobProfileResponse>;
  update(data: UpdateJobProfileDto): Promise<JobProfileResponse>;
  delete(id: string): Promise<{ statusCode: number; message: string; }>;
  getByTitle(title: string): Promise<JobProfileListResponse>;
  getRecent(count?: number): Promise<JobProfileListResponse>;
}