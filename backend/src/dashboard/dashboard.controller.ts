import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('graph')
  getGraphData() {
    return this.dashboardService.getGraphData();
  }

  @Get('courses')
  getCourses() {
    return this.dashboardService.getCourses();
  }
}
